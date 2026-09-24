import sql from '../database/db.js';

const usuarioRepository = {
  async readAll() {
    return await sql`SELECT * FROM usuarios WHERE ativo = true ORDER BY data_cadastro DESC`;
  },

  async readById(id) {
    const [usuario] = await sql`
      SELECT * FROM usuarios WHERE id = ${id} AND ativo = true
    `;
    return usuario;
  },

  async emailExiste(email) {
    const [row] = await sql`
      SELECT 1 FROM usuarios WHERE lower(email) = lower(${email}) AND ativo = true
    `;
    return !!row;
  },

  async cpfExiste(cpf) {
    const [row] = await sql`
      SELECT 1 FROM usuarios WHERE cpf = ${cpf} AND ativo = true
    `;
    return !!row;
  },

  async buscaPorEmail(email) {
    const [usuario] = await sql`
      SELECT * FROM usuarios WHERE lower(email) = lower(${email})
    `;
    return usuario;
  },

  async create(usuario) {
    const id = `user_${Date.now()}`;
    const {
      nome, email, cpf, telefone, senha, endereco, cidade, uf, cep,
      profissao, experiencia, habilidades, disponibilidade,
    } = usuario;

    const [novoUsuario] = await sql`
      INSERT INTO usuarios (
        id, nome, email, cpf, telefone, senha, endereco, cidade, uf, cep,
        profissao, experiencia, habilidades, disponibilidade
      ) VALUES (
        ${id}, ${nome}, ${email}, ${cpf}, ${telefone}, ${senha}, ${endereco}, ${cidade}, ${uf}, ${cep},
        ${profissao}, ${experiencia}, ${habilidades}, ${disponibilidade}
      )
      RETURNING *
    `;
    return novoUsuario;
  },

  async update(id, dados) {
    const {
      nome, email, cpf, telefone, senha, endereco, cidade, uf, cep,
      profissao, experiencia, habilidades, disponibilidade,
    } = dados;

    const [atualizado] = await sql`
      UPDATE usuarios SET
        nome            = COALESCE(${nome ?? null}, nome),
        email           = COALESCE(${email ?? null}, email),
        cpf             = COALESCE(${cpf ?? null}, cpf),
        telefone        = COALESCE(${telefone ?? null}, telefone),
        senha           = COALESCE(${senha ?? null}, senha),
        endereco        = COALESCE(${endereco ?? null}, endereco),
        cidade          = COALESCE(${cidade ?? null}, cidade),
        uf              = COALESCE(${uf ?? null}, uf),
        cep             = COALESCE(${cep ?? null}, cep),
        profissao       = COALESCE(${profissao ?? null}, profissao),
        experiencia     = COALESCE(${experiencia ?? null}, experiencia),
        habilidades     = COALESCE(${habilidades ?? null}, habilidades),
        disponibilidade = COALESCE(${disponibilidade ?? null}, disponibilidade)
      WHERE id = ${id}
      RETURNING *
    `;
    if (!atualizado) return null;
    const { senha: _senha, ...dadosSemSenha } = atualizado;
    return dadosSemSenha;
  },

  async deactivate(id) {
    const [row] = await sql`
      UPDATE usuarios SET ativo = false WHERE id = ${id} RETURNING id
    `;
    return !!row;
  },
};

export default usuarioRepository;
