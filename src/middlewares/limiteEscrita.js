import { rateLimit } from "express-rate-limit";

// Freio para criar/alterar vagas e candidaturas (por IP). Bem mais folgado que o do login.
const limiteEscrita = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_req, res) {
    res.status(429).json({ ok: false, erro: "Muitas requisições. Tente novamente em alguns minutos." });
  },
});

export default limiteEscrita;
