process.env.JWT_SECRET ??= "segredo-apenas-para-testes";
process.env.DATABASE_URL ??=
  process.env.DATABASE_TEST_URL ?? "postgresql://test:test@localhost/test";
