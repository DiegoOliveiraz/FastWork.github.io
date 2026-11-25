process.env.JWT_SECRET ??= "segredo-apenas-para-testes";
process.env.ALLOWED_ORIGIN ??= "http://localhost:3000";
process.env.DATABASE_URL ??=
  process.env.DATABASE_TEST_URL ?? "postgresql://test:test@localhost/test";
