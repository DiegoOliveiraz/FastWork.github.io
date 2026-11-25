export function exigirTipo(tipo) {
  return (req, res, next) => {
    if (req.usuarioLogado?.tp_usuario !== tipo) {
      return res.status(403).json({
        ok: false,
        erro: 'Você não tem permissão para acessar este recurso',
      });
    }

    next();
  };
}

export function exigirDono(buscarIdUsuarioDono) {
  return async (req, res, next) => {
    if (req.usuarioLogado?.id_usuario == null) {
      return res.status(401).json({ ok: false, erro: 'Usuário não autenticado' });
    }

    try {
      const idUsuarioDono = await buscarIdUsuarioDono(req);

      // Deixa o controller responder com o 404 específico do recurso.
      if (idUsuarioDono == null) {
        return next();
      }

      if (String(req.usuarioLogado.id_usuario) !== String(idUsuarioDono)) {
        return res.status(403).json({
          ok: false,
          erro: 'Você não tem permissão para alterar este recurso',
        });
      }

      next();
    } catch (erro) {
      next(erro);
    }
  };
}
