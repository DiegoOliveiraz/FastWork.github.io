import sql from '../database/db.js';

const empresaRepository = {
  async readAll() {
    return await sql`
      SELECT e.*, u.nm_usuario, u.ds_email, u.ds_telefone, u.st_ativo
      FROM empresas e
      JOIN usuarios u ON u.id_usuario = e.id_usuario
      WHERE u.st_ativo = true
      ORDER BY e.dt_criacao DESC
    `;
  },

  async readById(id_empresa) {
    const [empresa] = await sql`
      SELECT e.*, u.nm_usuario, u.ds_email, u.ds_telefone, u.st_ativo
      FROM empresas e
      JOIN usuarios u ON u.id_usuario = e.id_usuario
      WHERE e.id_empresa = ${id_empresa} AND u.st_ativo = true
    `;
    return empresa;
  },

  async readByIdUsuario(id_usuario) {
    const [empresa] = await sql`
      SELECT * FROM empresas WHERE id_usuario = ${id_usuario}
    `;
    return empresa;
  },

  async cnpjExiste(ds_cnpj) {
    const [row] = await sql`SELECT 1 FROM empresas WHERE ds_cnpj = ${ds_cnpj}`;
    return !!row;
  },

  async update(id_empresa, dados) {
    const {
      nm_fantasia, nm_razao_social, ds_setor, ds_site,
      ds_endereco, ds_cidade, ds_estado, ds_descricao,
    } = dados;

    const [atualizada] = await sql`
      UPDATE empresas SET
        nm_fantasia     = COALESCE(${nm_fantasia ?? null}, nm_fantasia),
        nm_razao_social = COALESCE(${nm_razao_social ?? null}, nm_razao_social),
        ds_setor        = COALESCE(${ds_setor ?? null}, ds_setor),
        ds_site         = COALESCE(${ds_site ?? null}, ds_site),
        ds_endereco     = COALESCE(${ds_endereco ?? null}, ds_endereco),
        ds_cidade       = COALESCE(${ds_cidade ?? null}, ds_cidade),
        ds_estado       = COALESCE(${ds_estado ?? null}, ds_estado),
        ds_descricao    = COALESCE(${ds_descricao ?? null}, ds_descricao)
      WHERE id_empresa = ${id_empresa}
      RETURNING *
    `;
    return atualizada;
  },
};

export default empresaRepository;
