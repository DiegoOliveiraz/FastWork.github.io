// Erro previsto pelas regras do sistema (vaga fechada, sem permissão, duplicidade...).
// Carrega o status HTTP que o controller deve devolver.
export class ErroNegocio extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.name = "ErroNegocio";
    this.status = status;
  }
}

// Converte qualquer erro em resposta JSON. Detalhes internos só vão para o log.
export function responderErro(res, erro, contexto) {
  if (erro instanceof ErroNegocio) {
    return res.status(erro.status).json({ ok: false, erro: erro.message });
  }
  if (erro?.code === "23505") {
    return res.status(409).json({ ok: false, erro: "Registro duplicado" });
  }
  // 22P02 = texto no lugar de número; 22003 = número fora do limite do INTEGER
  if (erro?.code === "22P02" || erro?.code === "22003") {
    return res.status(400).json({ ok: false, erro: "Dados inválidos" });
  }
  // P0001 = RAISE EXCEPTION dos triggers opcionais de 002_bd2_vagas.sql
  if (erro?.code === "P0001") {
    return res.status(409).json({ ok: false, erro: "Operação não permitida pelas regras do banco" });
  }
  console.error(`Erro em ${contexto}:`, erro);
  return res.status(500).json({ ok: false, erro: `Erro interno em ${contexto}` });
}

// Lê um id de rota (":id") e garante inteiro positivo dentro do limite do INTEGER do Postgres.
export function lerId(valor) {
  const texto = String(valor ?? "");
  if (!/^\d{1,10}$/.test(texto)) return null;
  const numero = Number(texto);
  return numero >= 1 && numero <= 2147483647 ? numero : null;
}
