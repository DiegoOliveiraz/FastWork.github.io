import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL não definida. Copie a connection string do painel do Neon (Dashboard > Connection Details) e configure a env var DATABASE_URL.'
  );
}

// `neon()` cria um cliente HTTP sem estado — ideal para funções serverless
// (Vercel), porque não mantém conexão TCP aberta entre invocações.
const sql = neon(process.env.DATABASE_URL);

export default sql;