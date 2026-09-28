import sql from "../database/db.js";

const profissionalRepository = {
  async readAll() {
    return await sql`
      SELECT p.*, u.nm_usuario, u.ds_email, u.ds_telefone, u.st_ativo
      FROM profissionais p
      JOIN usuarios u ON u.id_usuario = p.id_usuario
      WHERE u.st_ativo = true
      ORDER BY p.dt_criacao DESC
    `;
  },

  async readById(id_profissional) {
    const [profissional] = await sql`
      SELECT p.*, u.nm_usuario, u.ds_email, u.ds_telefone, u.st_ativo
      FROM profissionais p
      JOIN usuarios u ON u.id_usuario = p.id_usuario
      WHERE p.id_profissional = ${id_profissional} AND u.st_ativo = true
    `;
    return profissional;
  },

  async readByIdUsuario(id_usuario) {
    const [profissional] = await sql`
      SELECT * FROM profissionais WHERE id_usuario = ${id_usuario}
    `;
    return profissional;
  },

  async update(id_profissional, dados) {
    const {
      ds_logradouro,
      ds_cidade,
      ds_estado,
      ds_cep,
      ds_profissao,
      ds_resumo,
      ds_linkedin,
      nr_experiencia,
      ds_habilidades,
      st_disponibilidade,
    } = dados;

    const [atualizado] = await sql`
      UPDATE profissionais SET
        ds_logradouro      = COALESCE(${ds_logradouro ?? null}, ds_logradouro),
        ds_cidade          = COALESCE(${ds_cidade ?? null}, ds_cidade),
        ds_estado          = COALESCE(${ds_estado ?? null}, ds_estado),
        ds_cep             = COALESCE(${ds_cep ?? null}, ds_cep),
        ds_profissao       = COALESCE(${ds_profissao ?? null}, ds_profissao),
        ds_resumo          = COALESCE(${ds_resumo ?? null}, ds_resumo),
        ds_linkedin        = COALESCE(${ds_linkedin ?? null}, ds_linkedin),
        nr_experiencia     = COALESCE(${nr_experiencia ?? null}, nr_experiencia),
        ds_habilidades     = COALESCE(${ds_habilidades ?? null}, ds_habilidades),
        st_disponibilidade = COALESCE(${st_disponibilidade ?? null}, st_disponibilidade),
        dt_atualizacao     = now()
      WHERE id_profissional = ${id_profissional}
      RETURNING *
    `;
    return atualizado;
  },
  async readPaginated({ profissao, cidade, disponivel, limit, offset }) {
    const profissionais = await sql`
    SELECT
      p.id_profissional,
      p.id_usuario,
      p.ds_profissao,
      p.ds_cidade,
      p.ds_estado,
      p.nr_experiencia,
      p.ds_habilidades,
      p.st_disponibilidade,
      p.dt_criacao,
      u.nm_usuario,
      u.ds_email,
      u.ds_telefone
    FROM profissionais p
    INNER JOIN usuarios u
      ON u.id_usuario = p.id_usuario
    WHERE u.st_ativo = true
      AND (
        ${profissao}::text IS NULL
        OR p.ds_profissao ILIKE '%' || ${profissao} || '%'
      )
      AND (
      ${cidade}::text IS NULL
        OR p.ds_cidade ILIKE '%' || ${cidade} || '%'
      )
      AND (
        ${disponivel}::boolean IS NULL
        OR p.st_disponibilidade = ${disponivel}::boolean
      )
    ORDER BY p.dt_criacao DESC, p.id_profissional DESC
    LIMIT ${limit}
    OFFSET ${offset}  
    `;

    const [{ total }] = await sql`
    SELECT COUNT(*) AS total
    FROM profissionais p
    INNER JOIN usuarios u
      ON u.id_usuario = p.id_usuario
    WHERE u.st_ativo = true
      AND (
        ${profissao}::text IS NULL
        OR p.ds_profissao ILIKE '%' || ${profissao} || '%'
      )
      AND (
      ${cidade}::text IS NULL
        OR p.ds_cidade ILIKE '%' || ${cidade} || '%'
      )
      AND (
        ${disponivel}::boolean IS NULL
        OR p.st_disponibilidade = ${disponivel}::boolean
      )
    `;

    return {
      profissionais,
      total: Number(total),
    };
  },
};

export default profissionalRepository;
