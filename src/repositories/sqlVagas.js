// Trechos de SQL reaproveitados pelas consultas de vagas.
//
// Datas: as colunas são TIMESTAMP (sem fuso). Gravamos e comparamos sempre em UTC,
// qualquer que seja o fuso da sessão do banco:
//   - entrada:  '<ISO>'::timestamptz AT TIME ZONE 'UTC'   (vira horário UTC "sem fuso")
//   - saída:    coluna AT TIME ZONE 'UTC'                  (vira instante com fuso; o JSON sai em ISO)
export const AGORA_UTC = "(now() AT TIME ZONE 'UTC')";

// Situação calculada na hora da consulta, sem precisar de job agendado:
// uma vaga "aberta" cujo prazo passou aparece como "expirada".
export const SITUACAO_VAGA = `
  CASE
    WHEN v.st_vaga = 'fechada' THEN 'fechada'
    WHEN v.st_vaga = 'pausada' THEN 'pausada'
    WHEN v.dt_publicacao IS NOT NULL AND v.dt_publicacao > ${AGORA_UTC} THEN 'agendada'
    WHEN v.dt_encerramento IS NOT NULL AND v.dt_encerramento <= ${AGORA_UTC} THEN 'expirada'
    ELSE 'aberta'
  END`;

// Vaga que aceita candidaturas agora.
export const ABERTA_AGORA = `
  v.st_vaga = 'aberta'
  AND (v.dt_publicacao IS NULL OR v.dt_publicacao <= ${AGORA_UTC})
  AND (v.dt_encerramento IS NULL OR v.dt_encerramento > ${AGORA_UTC})`;

export const COLUNAS_VAGA = `
  v.id_vaga, v.id_empresa, v.nm_cargo, v.ds_descricao, v.ds_requisitos,
  v.tp_contrato, v.tp_modalidade, v.vl_salario::float8 AS vl_salario,
  v.ds_cidade, v.ds_estado, v.st_vaga,
  (v.dt_criacao AT TIME ZONE 'UTC') AS dt_criacao,
  (v.dt_publicacao AT TIME ZONE 'UTC') AS dt_publicacao,
  (v.dt_encerramento AT TIME ZONE 'UTC') AS dt_encerramento,
  ${SITUACAO_VAGA} AS situacao`;

// Escapa % e _ para o texto digitado no filtro não virar curinga do ILIKE.
export function escaparLike(texto) {
  return String(texto).replace(/[\\%_]/g, "\\$&");
}
