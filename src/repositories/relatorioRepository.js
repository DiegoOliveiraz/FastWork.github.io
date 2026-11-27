// BD2 – Consultas complexas (somente leitura). Cada uma indica a VIEW/FUNCTION equivalente
// de src/database/migrations/002_bd2_vagas.sql, caso você prefira criá-la no Neon.
import { consultar } from "../database/pool.js";
import { ErroNegocio } from "../utils/erroNegocio.js";
import { AGORA_UTC } from "./sqlVagas.js";

const relatorioRepository = {
  // CTE + subconsultas escalares + NOT EXISTS: painel de números da empresa.
  async resumoDaEmpresa(id_empresa) {
    const [resumo] = await consultar(
      `WITH minhas AS (
         SELECT id_vaga, st_vaga FROM vagas WHERE id_empresa = $1
       ),
       candidatos AS (
         SELECT c.id_candidatura, c.id_vaga, c.st_candidatura
           FROM candidaturas c JOIN minhas m ON m.id_vaga = c.id_vaga
       )
       SELECT
         (SELECT COUNT(*) FROM minhas)::int                                       AS total_vagas,
         (SELECT COUNT(*) FROM minhas WHERE st_vaga = 'aberta')::int              AS vagas_abertas,
         (SELECT COUNT(*) FROM candidatos)::int                                   AS total_candidaturas,
         (SELECT COUNT(*) FROM candidatos WHERE st_candidatura = 'aprovada')::int AS aprovadas,
         (SELECT COUNT(*) FROM minhas m
           WHERE NOT EXISTS (SELECT 1 FROM candidatos c WHERE c.id_vaga = m.id_vaga))::int
                                                                                  AS vagas_sem_candidatos`,
      [id_empresa],
    );
    return resumo;
  },

  // Subconsulta NOT EXISTS + subconsulta escalar: profissionais disponíveis, da mesma profissão
  // da vaga, que ainda NÃO se candidataram. Sem dados de contato (só a empresa vê contato de quem
  // se candidatou).
  async profissionaisCompativeis({ id_vaga, id_empresa }) {
    const [vaga] = await consultar("SELECT id_empresa, nm_cargo FROM vagas WHERE id_vaga = $1", [id_vaga]);
    if (!vaga) throw new ErroNegocio(404, "Vaga não encontrada");
    if (vaga.id_empresa !== id_empresa) {
      throw new ErroNegocio(403, "Você não tem permissão para ver esta vaga");
    }

    return consultar(
      `SELECT p.id_profissional, u.nm_usuario, p.ds_profissao, p.ds_cidade, p.ds_estado,
              p.nr_experiencia,
              (SELECT COUNT(*) FROM candidaturas c2
                WHERE c2.id_profissional = p.id_profissional
                  AND c2.st_candidatura IN ('pendente', 'em_analise'))::int AS candidaturas_em_andamento
         FROM profissionais p
         JOIN usuarios u ON u.id_usuario = p.id_usuario
        WHERE u.st_ativo = true
          AND p.st_disponibilidade = true
          AND lower(btrim(p.ds_profissao)) = lower(btrim($2))
          AND NOT EXISTS (SELECT 1 FROM candidaturas c WHERE c.id_vaga = $1 AND c.id_profissional = p.id_profissional)
        ORDER BY COALESCE(p.nr_experiencia, 0) DESC, p.id_profissional
        LIMIT 20`,
      [id_vaga, vaga.nm_cargo],
    );
  },

  // CTEs + FULL JOIN + HAVING: vagas abertas x profissionais disponíveis por profissão.
  // Equivale à VIEW vw_demanda_oferta_profissao.
  async demandaOferta() {
    return consultar(
      `WITH demanda AS (
         SELECT lower(btrim(v.nm_cargo)) AS profissao, COUNT(*)::int AS vagas_abertas
           FROM vagas v
          WHERE v.st_vaga = 'aberta'
            AND (v.dt_publicacao IS NULL OR v.dt_publicacao <= ${AGORA_UTC})
            AND (v.dt_encerramento IS NULL OR v.dt_encerramento > ${AGORA_UTC})
          GROUP BY 1
       ),
       oferta AS (
         SELECT lower(btrim(p.ds_profissao)) AS profissao, COUNT(*)::int AS profissionais_disponiveis
           FROM profissionais p JOIN usuarios u ON u.id_usuario = p.id_usuario
          WHERE u.st_ativo = true AND p.st_disponibilidade = true AND p.ds_profissao IS NOT NULL
          GROUP BY 1
       )
       SELECT COALESCE(d.profissao, o.profissao) AS profissao,
              COALESCE(d.vagas_abertas, 0) AS vagas_abertas,
              COALESCE(o.profissionais_disponiveis, 0) AS profissionais_disponiveis,
              CASE WHEN COALESCE(o.profissionais_disponiveis, 0) = 0 THEN NULL
                   ELSE ROUND(COALESCE(d.vagas_abertas, 0)::numeric / o.profissionais_disponiveis, 2)::float8
              END AS vagas_por_profissional
         FROM demanda d
         FULL JOIN oferta o ON o.profissao = d.profissao
        GROUP BY d.profissao, o.profissao, d.vagas_abertas, o.profissionais_disponiveis
       HAVING COALESCE(d.vagas_abertas, 0) + COALESCE(o.profissionais_disponiveis, 0) > 0
        ORDER BY vagas_abertas DESC, profissionais_disponiveis DESC, profissao`,
    );
  },
};

export default relatorioRepository;
