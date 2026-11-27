// DBE2 – Transações complexas do módulo de vagas.
//
// Regras que valem para as três transações de escrita abaixo:
//  1. Ordem de travas fixa: primeiro a linha da VAGA, depois as CANDIDATURAS. Assim duas
//     operações simultâneas nunca se esperam em círculo (deadlock).
//  2. Qualquer erro lançado dentro de comTransacao() desfaz TUDO (ROLLBACK).
//  3. As checagens acontecem depois da trava, então o que foi lido continua valendo até o COMMIT.
import { comTransacao, consultar } from "../database/pool.js";
import { ErroNegocio } from "../utils/erroNegocio.js";
import { profissaoCompativel } from "../utils/profissoes.js";
import { AGORA_UTC, SITUACAO_VAGA } from "./sqlVagas.js";

// "FOR SHARE": várias pessoas podem se candidatar ao mesmo tempo, mas ninguém consegue
//              fechar a vaga (FOR UPDATE) no meio de uma candidatura.
// "FOR UPDATE": exclusivo; usado por quem muda a vaga.
async function travarVaga(q, id_vaga, modo) {
  const [vaga] = await q(
    `SELECT v.id_vaga, v.id_empresa, v.nm_cargo, v.st_vaga,
            ${SITUACAO_VAGA} AS situacao
       FROM vagas v
      WHERE v.id_vaga = $1
        FOR ${modo}`,
    [id_vaga],
  );
  if (!vaga) throw new ErroNegocio(404, "Vaga não encontrada");
  return vaga;
}

function exigirDona(vaga, id_empresa) {
  if (vaga.id_empresa !== id_empresa) {
    throw new ErroNegocio(403, "Você não tem permissão para gerenciar esta vaga");
  }
}

// Fecha a vaga agora. Se o prazo ainda não tinha chegado, antecipa; se já tinha passado, mantém a data.
const FECHAR_VAGA_SQL = `
  UPDATE vagas
     SET st_vaga = 'fechada',
         dt_encerramento = LEAST(COALESCE(dt_encerramento, ${AGORA_UTC}), ${AGORA_UTC})
   WHERE id_vaga = $1`;

const candidaturaRepository = {
  // ── Profissional se candidata ────────────────────────────────────────────────────
  // BEGIN → trava a vaga (FOR SHARE) → vaga aberta? → profissão compatível?
  //       → INSERT (ON CONFLICT evita duplicar) → COMMIT
  async candidatar({ id_vaga, profissional, carta }) {
    return comTransacao(async (q) => {
      const vaga = await travarVaga(q, id_vaga, "SHARE");

      if (vaga.situacao !== "aberta") {
        throw new ErroNegocio(409, "Esta vaga não está aberta para candidaturas");
      }
      if (!profissaoCompativel(profissional.ds_profissao, vaga.nm_cargo)) {
        throw new ErroNegocio(
          403,
          `Esta vaga é para ${vaga.nm_cargo}. Sua profissão cadastrada não corresponde.`,
        );
      }

      const [candidatura] = await q(
        `INSERT INTO candidaturas (id_profissional, id_vaga, ds_carta_apresentacao, st_candidatura, dt_candidatura)
         VALUES ($1, $2, $3, 'pendente', ${AGORA_UTC})
         ON CONFLICT (id_profissional, id_vaga) DO NOTHING
         RETURNING id_candidatura, id_vaga, st_candidatura`,
        [profissional.id_profissional, id_vaga, carta ?? null],
      );
      if (!candidatura) throw new ErroNegocio(409, "Você já se candidatou a esta vaga");

      return candidatura;
    });
  },

  // ── Empresa encerra a vaga ───────────────────────────────────────────────────────
  // BEGIN → trava a vaga (FOR UPDATE) → é dela? já encerrada? → fecha a vaga
  //       → rejeita candidaturas pendentes/em análise → COMMIT
  async encerrarVaga({ id_vaga, id_empresa }) {
    return comTransacao(async (q) => {
      const vaga = await travarVaga(q, id_vaga, "UPDATE");
      exigirDona(vaga, id_empresa);
      if (vaga.st_vaga === "fechada") throw new ErroNegocio(409, "Esta vaga já está encerrada");

      await q(FECHAR_VAGA_SQL, [id_vaga]);
      const rejeitadas = await q(
        `UPDATE candidaturas
            SET st_candidatura = 'rejeitada', dt_atualizacao = ${AGORA_UTC}
          WHERE id_vaga = $1 AND st_candidatura IN ('pendente', 'em_analise')
        RETURNING id_candidatura`,
        [id_vaga],
      );

      return { id_vaga, candidaturas_rejeitadas: rejeitadas.length };
    });
  },

  // ── Empresa aprova um candidato ──────────────────────────────────────────────────
  // BEGIN → trava a vaga → trava a candidatura → ainda está em aberto?
  //       → aprova esta → rejeita as demais → fecha a vaga → COMMIT
  // Resultado: nunca existem duas aprovações na mesma vaga, mesmo com cliques simultâneos.
  async aprovarCandidato({ id_candidatura, id_empresa }) {
    return comTransacao(async (q) => {
      // Leitura sem trava só para descobrir de qual vaga é a candidatura.
      const [previa] = await q("SELECT id_vaga FROM candidaturas WHERE id_candidatura = $1", [id_candidatura]);
      if (!previa) throw new ErroNegocio(404, "Candidatura não encontrada");

      const vaga = await travarVaga(q, previa.id_vaga, "UPDATE");
      exigirDona(vaga, id_empresa);
      if (vaga.st_vaga === "fechada") throw new ErroNegocio(409, "Esta vaga já está encerrada");

      const [candidatura] = await q(
        "SELECT st_candidatura FROM candidaturas WHERE id_candidatura = $1 FOR UPDATE",
        [id_candidatura],
      );
      if (!candidatura) throw new ErroNegocio(404, "Candidatura não encontrada");
      if (!["pendente", "em_analise"].includes(candidatura.st_candidatura)) {
        throw new ErroNegocio(409, "Esta candidatura já foi decidida");
      }

      await q(
        `UPDATE candidaturas SET st_candidatura = 'aprovada', dt_atualizacao = ${AGORA_UTC}
          WHERE id_candidatura = $1`,
        [id_candidatura],
      );
      const rejeitadas = await q(
        `UPDATE candidaturas
            SET st_candidatura = 'rejeitada', dt_atualizacao = ${AGORA_UTC}
          WHERE id_vaga = $1 AND id_candidatura <> $2 AND st_candidatura IN ('pendente', 'em_analise')
        RETURNING id_candidatura`,
        [vaga.id_vaga, id_candidatura],
      );
      await q(FECHAR_VAGA_SQL, [vaga.id_vaga]);

      return { id_candidatura, id_vaga: vaga.id_vaga, candidaturas_rejeitadas: rejeitadas.length };
    });
  },

  // ── Empresa move a candidatura para "em análise" ─────────────────────────────────
  async marcarEmAnalise({ id_candidatura, id_empresa }) {
    return comTransacao(async (q) => {
      const [previa] = await q("SELECT id_vaga FROM candidaturas WHERE id_candidatura = $1", [id_candidatura]);
      if (!previa) throw new ErroNegocio(404, "Candidatura não encontrada");

      const vaga = await travarVaga(q, previa.id_vaga, "UPDATE");
      exigirDona(vaga, id_empresa);
      if (vaga.st_vaga === "fechada") throw new ErroNegocio(409, "Esta vaga já está encerrada");

      const [atualizada] = await q(
        `UPDATE candidaturas SET st_candidatura = 'em_analise', dt_atualizacao = ${AGORA_UTC}
          WHERE id_candidatura = $1 AND st_candidatura = 'pendente'
        RETURNING id_candidatura, st_candidatura`,
        [id_candidatura],
      );
      if (!atualizada) throw new ErroNegocio(409, "Só candidaturas pendentes podem ir para análise");
      return atualizada;
    });
  },

  // ── Consultas ────────────────────────────────────────────────────────────────────
  // BD2 – window function: RANK() ordena os candidatos por experiência (empate divide a posição).
  // Equivale a fn_ranking_candidatos(id_vaga) de 002_bd2_vagas.sql.
  // Só a empresa dona da vaga vê esta lista (inclui contato dos candidatos).
  async listarPorVaga({ id_vaga, id_empresa }) {
    const [vaga] = await consultar("SELECT id_empresa FROM vagas WHERE id_vaga = $1", [id_vaga]);
    if (!vaga) throw new ErroNegocio(404, "Vaga não encontrada");
    exigirDona(vaga, id_empresa);

    return consultar(
      `SELECT c.id_candidatura, c.st_candidatura, c.ds_carta_apresentacao,
              (c.dt_candidatura AT TIME ZONE 'UTC') AS dt_candidatura,
              p.id_profissional, u.nm_usuario, u.ds_email, u.ds_telefone,
              p.ds_profissao, p.ds_cidade, p.ds_estado, p.nr_experiencia, p.ds_habilidades,
              RANK() OVER (ORDER BY COALESCE(p.nr_experiencia, 0) DESC)::int AS posicao
         FROM candidaturas c
         JOIN profissionais p ON p.id_profissional = c.id_profissional
         JOIN usuarios u ON u.id_usuario = p.id_usuario
        WHERE c.id_vaga = $1 AND u.st_ativo = true
        ORDER BY posicao, c.dt_candidatura`,
      [id_vaga],
    );
  },

  async listarDoProfissional(id_profissional) {
    return consultar(
      `SELECT c.id_candidatura, c.st_candidatura,
              (c.dt_candidatura AT TIME ZONE 'UTC') AS dt_candidatura,
              v.id_vaga, v.nm_cargo, v.ds_cidade, v.ds_estado,
              ${SITUACAO_VAGA} AS situacao_vaga,
              ue.nm_usuario AS nm_empresa
         FROM candidaturas c
         JOIN vagas v ON v.id_vaga = c.id_vaga
         JOIN empresas e ON e.id_empresa = v.id_empresa
         JOIN usuarios ue ON ue.id_usuario = e.id_usuario
        WHERE c.id_profissional = $1
        ORDER BY c.dt_candidatura DESC`,
      [id_profissional],
    );
  },
};

export default candidaturaRepository;
