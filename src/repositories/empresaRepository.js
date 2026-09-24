import sql from '../database/db.js';

const empresaRepository = {
  async readAll() {
    return await sql`SELECT * FROM empresas WHERE ativo = true ORDER BY data_cadastro DESC`;
  },

  async readById(id) {
    const [empresa] = await sql`
      SELECT * FROM empresas WHERE id = ${id} AND ativo = true
    `;
    return empresa;
  },

  async emailExiste(email) {
    const [row] = await sql`
      SELECT 1 FROM empresas WHERE lower(email) = lower(${email}) AND ativo = true
    `;
    return !!row;
  },

  async cnpjExiste(cnpj) {
    const [row] = await sql`
      SELECT 1 FROM empresas WHERE cnpj = ${cnpj} AND ativo = true
    `;
    return !!row;
  },

  async buscaPorEmail(email) {
    const [empresa] = await sql`
      SELECT * FROM empresas WHERE lower(email) = lower(${email})
    `;
    return empresa;
  },

  async create(empresa) {
    const id = `emp_${Date.now()}`;
    const { nome, cnpj, email, telefone, senha, endereco, setor } = empresa;

    const [novaEmpresa] = await sql`
      INSERT INTO empresas (id, nome, cnpj, email, telefone, senha, endereco, setor)
      VALUES (${id}, ${nome}, ${cnpj}, ${email}, ${telefone}, ${senha}, ${endereco}, ${setor})
      RETURNING *
    `;
    return novaEmpresa;
  },

  async update(id, dados) {
    const { nome, cnpj, email, telefone, senha, endereco, setor } = dados;

    const [atualizada] = await sql`
      UPDATE empresas SET
        nome     = COALESCE(${nome ?? null}, nome),
        cnpj     = COALESCE(${cnpj ?? null}, cnpj),
        email    = COALESCE(${email ?? null}, email),
        telefone = COALESCE(${telefone ?? null}, telefone),
        senha    = COALESCE(${senha ?? null}, senha),
        endereco = COALESCE(${endereco ?? null}, endereco),
        setor    = COALESCE(${setor ?? null}, setor)
      WHERE id = ${id}
      RETURNING *
    `;
    if (!atualizada) return null;
    const { senha: _senha, ...dadosSemSenha } = atualizada;
    return dadosSemSenha;
  },

  async deactivate(id) {
    const [row] = await sql`
      UPDATE empresas SET ativo = false WHERE id = ${id} RETURNING id
    `;
    return !!row;
  },
};

export default empresaRepository;
