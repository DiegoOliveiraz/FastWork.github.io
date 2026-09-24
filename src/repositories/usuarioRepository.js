import sql from '../database/db.js';

const usuarioRepository = {
  async readById(id_usuario) {
    const [usuario] = await sql`
      SELECT * FROM usuarios WHERE id_usuario = ${id_usuario} AND st_ativo = true
    `;
    return usuario;
  },

  async emailExiste(ds_email) {
    const [row] = await sql`
      SELECT 1 FROM usuarios WHERE lower(ds_email) = lower(${ds_email}) AND st_ativo = true
    `;
    return !!row;
  },

  async buscaPorEmail(ds_email) {
    const [usuario] = await sql`
      SELECT * FROM usuarios WHERE lower(ds_email) = lower(${ds_email})
    `;
    return usuario;
  },

  async update(id_usuario, dados) {
    const { nm_usuario, ds_email, ds_senha, ds_telefone } = dados;

    const [atualizado] = await sql`
      UPDATE usuarios SET
        nm_usuario     = COALESCE(${nm_usuario ?? null}, nm_usuario),
        ds_email       = COALESCE(${ds_email ?? null}, ds_email),
        ds_senha       = COALESCE(${ds_senha ?? null}, ds_senha),
        ds_telefone    = COALESCE(${ds_telefone ?? null}, ds_telefone),
        dt_atualizacao = now()
      WHERE id_usuario = ${id_usuario}
      RETURNING *
    `;
    return atualizado;
  },

  async deactivate(id_usuario) {
    const [row] = await sql`
      UPDATE usuarios SET st_ativo = false WHERE id_usuario = ${id_usuario} RETURNING id_usuario
    `;
    return !!row;
  },
};

export default usuarioRepository;
