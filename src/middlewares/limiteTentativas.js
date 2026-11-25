import { rateLimit } from "express-rate-limit";

const limiteTentativas = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_req, res) {
    res.status(429).json({
      ok: false,
      erro: "Muitas tentativas. Tente novamente em 15 minutos.",
    });
  },
});

export default limiteTentativas;
