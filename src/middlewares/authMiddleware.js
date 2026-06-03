import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_padrao_123';

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