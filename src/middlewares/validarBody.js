export default function validarBody(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({ ok: false, erro: "Dados inválidos" });
    }

    req.body = resultado.data;
    next();
  };
}
