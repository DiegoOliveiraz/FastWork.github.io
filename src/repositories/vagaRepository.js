import { consultar, comTransacao } from "../database/pool.js";
import { ErroNegocio } from "../utils/erroNegocio.js";
import { ABERTA_AGORA, AGORA_UTC, COLUNAS_VAGA, escaparLike } from "./sqlVagas.js";

// $n::timestamptz AT TIME ZONE 'UTC' → ver sqlVagas.js
const PARA_UTC = (n) => `$${n}::timestamptz AT TIME ZONE 'UTC'`;

const vagaRepository = {
  // Descobre quem é o usuário logado nas tabelas de perfil. Exige conta ativa:
  // um token ainda válido de uma conta desativada não passa daqui.
  async buscarEmpresaDoUsuario(id_usuario) {
    const [empresa] = await consultar(
      `SELECT e.id_empresa, u.nm_usuario AS nm_empresa
         FROM empresas e JOIN usuarios u ON u.id_usuario = e.id_usuario
        WHERE e.id_usuario = $1 AND u.st_ativo = true`,
      [id_usuario],
    );
    return empresa;
  },

  async buscarProfissionalDoUsuario(id_usuario) {
    const [profissional] = await consultar(
      `SELECT p.id_profissional, p.ds_profissao, u.nm_usuario
         FROM profissionais p JOIN usuarios u ON u.id_usuario = p.id_usuario
        WHERE p.id_usuario = $1 AND u.st_ativo = true`,
      [id_usuario],
    );
    return profissional;
  },

  async criar(id_empresa, dados) {
    const [vaga] = await consultar(
      `INSERT INTO vagas (
         id_empresa, nm_cargo, ds_descricao, ds_requisitos, tp_contrato, tp_modalidade,
         vl_salario, ds_cidade, ds_estado, st_vaga, dt_criacao, dt_publicacao, dt_encerramento
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, 'aberta', ${AGORA_UTC},
         COALESCE(${PARA_UTC(10)}, ${AGORA_UTC}), ${PARA_UTC(11)}
       ) RETURNING id_vaga`,
      [
        id_empresa, dados.nm_cargo, dados.ds_descricao ?? null, dados.ds_requisitos ?? null,
        dados.tp_contrato ?? null, dados.tp_modalidade ?? null, dados.vl_salario ?? null,
        dados.ds_cidade ?? null, dados.ds_estado ?? null,
        dados.dt_publicacao ?? null, dados.dt_encerramento ?? null,
      ],
    );
    return this.buscarPorId(vaga.id_vaga);
  },

  async buscarPorId(id_vaga) {
    const [vaga] = await consultar(
      `SELECT ${COLUNAS_VAGA}, u.nm_usuario AS nm_empresa
         FROM vagas v
         JOIN empresas e ON e.id_empresa = v.id_empresa
         JOIN usuarios u ON u.id_usuario = e.id_usuario
        WHERE v.id_vaga = $1 AND u.st_ativo = true`,
      [id_vaga],
    );
    return vaga;
  },

  // Vagas que aceitam candidatura agora. `ja_candidatou` vem de uma subconsulta EXISTS.
  async listarAbertas({ profissao, cidade, limite, deslocamento, id_profissional }) {
    const filtros = `
      u.st_ativo = true
      AND ${ABERTA_AGORA}
      AND ($1::text IS NULL OR lower(btrim(v.nm_cargo)) = $1)
      AND ($2::text IS NULL OR v.ds_cidade ILIKE '%' || $2 || '%')`;
    const valoresFiltro = [profissao ?? null, cidade ? escaparLike(cidade) : null];

    const vagas = await consultar(
      `SELECT ${COLUNAS_VAGA}, u.nm_usuario AS nm_empresa,
              EXISTS (SELECT 1 FROM candidaturas c
                       WHERE c.id_vaga = v.id_vaga AND c.id_profissional = $3) AS ja_candidatou
         FROM vagas v
         JOIN empresas e ON e.id_empresa = v.id_empresa
         JOIN usuarios u ON u.id_usuario = e.id_usuario
        WHERE ${filtros}
        ORDER BY v.dt_publicacao DESC NULLS LAST, v.id_vaga DESC
        LIMIT $4 OFFSET $5`,
      [...valoresFiltro, id_profissional ?? null, limite, deslocamento],
    );

    const [{ total }] = await consultar(
      `SELECT COUNT(*)::int AS total
         FROM vagas v
         JOIN empresas e ON e.id_empresa = v.id_empresa
         JOIN usuarios u ON u.id_usuario = e.id_usuario
        WHERE ${filtros}`,
      valoresFiltro,
    );

    return { vagas, total };
  },

  // BD2 – consulta com JOIN + GROUP BY + agregação condicional (FILTER).
  // Equivale à VIEW vw_vagas_resumo de 002_bd2_vagas.sql: depois de criá-la no Neon,
  // troque o corpo por `SELECT * FROM vw_vagas_resumo WHERE id_empresa = $1`.
  async listarDaEmpresa(id_empresa) {
    return consultar(
      `SELECT ${COLUNAS_VAGA},
              COUNT(c.id_candidatura)::int                                             AS total_candidaturas,
              (COUNT(c.id_candidatura) FILTER (WHERE c.st_candidatura = 'pendente'))::int   AS pendentes,
              (COUNT(c.id_candidatura) FILTER (WHERE c.st_candidatura = 'em_analise'))::int AS em_analise,
              (COUNT(c.id_candidatura) FILTER (WHERE c.st_candidatura = 'aprovada'))::int   AS aprovadas,
              (COUNT(c.id_candidatura) FILTER (WHERE c.st_candidatura = 'rejeitada'))::int  AS rejeitadas
         FROM vagas v
         LEFT JOIN candidaturas c ON c.id_vaga = v.id_vaga
        WHERE v.id_empresa = $1
        GROUP BY v.id_vaga
        ORDER BY v.dt_criacao DESC, v.id_vaga DESC`,
      [id_empresa],
    );
  },

  // DBE2 – transação: edita a vaga garantindo dono, status e período consistentes.
  async atualizar(id_vaga, id_empresa, dados) {
    return comTransacao(async (q) => {
      const [atual] = await q(
        `SELECT v.id_empresa, v.st_vaga,
                (v.dt_publicacao AT TIME ZONE 'UTC') AS dt_publicacao,
                (v.dt_encerramento AT TIME ZONE 'UTC') AS dt_encerramento
           FROM vagas v WHERE v.id_vaga = $1 FOR UPDATE`,
        [id_vaga],
      );
      if (!atual) throw new ErroNegocio(404, "Vaga não encontrada");
      if (atual.id_empresa !== id_empresa) throw new ErroNegocio(403, "Você não tem permissão para alterar esta vaga");
      if (atual.st_vaga === "fechada") throw new ErroNegocio(409, "Vaga encerrada não pode ser editada");

      const abertura = dados.dt_publicacao ? new Date(dados.dt_publicacao) : atual.dt_publicacao;
      const fechamento = dados.dt_encerramento ? new Date(dados.dt_encerramento) : atual.dt_encerramento;
      if (abertura && fechamento && fechamento <= abertura) {
        throw new ErroNegocio(400, "O encerramento deve ser depois da abertura");
      }

      await q(
        `UPDATE vagas SET
           ds_descricao    = COALESCE($2, ds_descricao),
           ds_requisitos   = COALESCE($3, ds_requisitos),
           tp_contrato     = COALESCE($4, tp_contrato),
           tp_modalidade   = COALESCE($5, tp_modalidade),
           vl_salario      = COALESCE($6, vl_salario),
           ds_cidade       = COALESCE($7, ds_cidade),
           ds_estado       = COALESCE($8, ds_estado),
           dt_publicacao   = COALESCE(${PARA_UTC(9)}, dt_publicacao),
           dt_encerramento = COALESCE(${PARA_UTC(10)}, dt_encerramento)
         WHERE id_vaga = $1`,
        [
          id_vaga, dados.ds_descricao ?? null, dados.ds_requisitos ?? null, dados.tp_contrato ?? null,
          dados.tp_modalidade ?? null, dados.vl_salario ?? null, dados.ds_cidade ?? null,
          dados.ds_estado ?? null, dados.dt_publicacao ?? null, dados.dt_encerramento ?? null,
        ],
      );
    }).then(() => this.buscarPorId(id_vaga));
  },
};

export default vagaRepository;
