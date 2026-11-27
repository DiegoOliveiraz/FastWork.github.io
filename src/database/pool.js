// Acesso ao banco para o módulo de vagas (Lote 6 / DBE2).
//
// Por que `pg` e não o `neon()` das outras rotas?
// O cliente HTTP do Neon só executa consultas isoladas. Uma transação
// "complexa" precisa de BEGIN → SELECT ... FOR UPDATE → decisão em JavaScript →
// UPDATEs → COMMIT na MESMA conexão. Isso exige um Pool (conexão TCP).
// Use a connection string "pooled" do Neon (host com "-pooler") na Vercel.
import pg from "pg";

let pool;

function obterPool() {
  if (!pool) {
    // Criado sob demanda: importar este arquivo não abre conexão (testes sem banco funcionam).
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
    // Erro em conexão ociosa não pode derrubar o processo.
    pool.on("error", (erro) => console.error("Erro no pool do banco:", erro.message));
  }
  return pool;
}

// Consulta simples (fora de transação). Devolve só as linhas.
export async function consultar(texto, valores = []) {
  const { rows } = await obterPool().query(texto, valores);
  return rows;
}

// Executa `trabalho(q)` dentro de uma transação.
// - Se `trabalho` terminar normalmente: COMMIT.
// - Se lançar qualquer erro: ROLLBACK e o erro é repassado a quem chamou.
// `q(texto, valores)` roda na conexão da transação e devolve as linhas.
export async function comTransacao(trabalho) {
  const cliente = await obterPool().connect();
  const q = async (texto, valores = []) => (await cliente.query(texto, valores)).rows;
  try {
    await cliente.query("BEGIN");
    const resultado = await trabalho(q);
    await cliente.query("COMMIT");
    return resultado;
  } catch (erro) {
    try {
      await cliente.query("ROLLBACK");
    } catch {
      // se o ROLLBACK falhar a conexão já caiu; o erro original é o que importa
    }
    throw erro;
  } finally {
    cliente.release();
  }
}

// Usado nos testes e no encerramento limpo do servidor.
export async function encerrarPool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
