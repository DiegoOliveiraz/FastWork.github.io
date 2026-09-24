import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET não definida. Configure essa variável de ambiente (localmente no .env, e na Vercel em Environment Variables) com uma chave forte e aleatória.'
  );
}

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = {
  gerarToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  },

  validarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, erro: 'Token não fornecido' });
    }
    const token = authHeader.substring(7);
    try {
      req.usuarioLogado = jwt.verify(token, JWT_SECRET);
      next();
    } catch (e) {
      return res.status(401).json({ ok: false, erro: 'Token inválido ou expirado' });
    }
  }
};

export default authMiddleware;
