import sql from '../database/db.js';
import usuarioRepository from '../repositories/usuarioRepository.js';
import profissionalRepository from '../repositories/profissionalRepository.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import bcrypt from 'bcryptjs';

export async function cadastrarUsuario(req, res) {
  try {
    const {
      nm_usuario, ds_email, ds_senha, ds_telefone,
      ds_logradouro, ds_cidade, ds_estado, ds_cep, ds_profissao,
      ds_resumo, ds_linkedin, nr_experiencia, ds_habilidades,
      st_aceite_termos, st_disponibilidade,
    } = req.body;

    if (!nm_usuario || !ds_email || !ds_senha || !ds_telefone) {
      return res.status(400).json({
        ok: false,
        erro: 'Campos obrigatórios não preenchidos'
      });
    }

    if (await usuarioRepository.emailExiste(ds_email)) {
      return res.status(400).json({
        ok: false,
        erro: 'Email já cadastrado'
      });
    }

    const ds_senha_hash = bcrypt.hashSync(ds_senha, 10);

    // Insere em usuarios e profissionais numa única query (CTE), garantindo
    // atomicidade: se qualquer uma das duas partes falhar, nada é gravado.
    const [novoProfissional] = await sql`
      WITH novo_usuario AS (
        INSERT INTO usuarios (nm_usuario, ds_email, ds_senha, ds_telefone, tp_usuario)
        VALUES (${nm_usuario}, ${ds_email}, ${ds_senha_hash}, ${ds_telefone}, 'profissional')
        RETURNING id_usuario, nm_usuario, ds_email
      )
      INSERT INTO profissionais (
        id_usuario, ds_logradouro, ds_cidade, ds_estado, ds_cep, ds_profissao,
        ds_resumo, ds_linkedin, nr_experiencia, ds_habilidades, st_aceite_termos, st_disponibilidade
      )
      SELECT
        novo_usuario.id_usuario,
        ${ds_logradouro ?? null}, ${ds_cidade ?? null}, ${ds_estado ?? null}, ${ds_cep ?? null},
        ${ds_profissao ?? null}, ${ds_resumo ?? null}, ${ds_linkedin ?? null}, ${nr_experiencia ?? null},
        ${ds_habilidades ?? null}, ${st_aceite_termos ?? false}, ${st_disponibilidade ?? true}
      FROM novo_usuario
      RETURNING
        id_profissional, id_usuario,
        (SELECT nm_usuario FROM novo_usuario) AS nm_usuario,
        (SELECT ds_email FROM novo_usuario) AS ds_email
    `;

    res.status(201).json({
      ok: true,
      msg: 'Usuário cadastrado com sucesso',
      usuario: {
        id_usuario: novoProfissional.id_usuario,
        id_profissional: novoProfissional.id_profissional,
        nm_usuario: novoProfissional.nm_usuario,
        ds_email: novoProfissional.ds_email,
        tp_usuario: 'profissional',
      }
    });
  } catch (erro) {
    console.error('Erro ao cadastrar usuário:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao cadastrar usuário' });
  }
}

export async function loginUsuario(req, res) {
  try {
    const { ds_email, ds_senha } = req.body;

    if (!ds_email || !ds_senha) {
      return res.status(400).json({
        ok: false,
        erro: 'Email e senha são obrigatórios'
      });
    }

    const usuario = await usuarioRepository.buscaPorEmail(ds_email);
    if (!usuario || usuario.tp_usuario !== 'profissional') {
      return res.status(401).json({
        ok: false,
        erro: 'Credenciais inválidas'
      });
    }

    if (!usuario.st_ativo) {
      return res.status(401).json({
        ok: false,
        erro: 'Usuário desativado'
      });
    }

    if (!bcrypt.compareSync(ds_senha, usuario.ds_senha)) {
      return res.status(401).json({
        ok: false,
        erro: 'Credenciais inválidas'
      });
    }

    const token = authMiddleware.gerarToken({
      id_usuario: usuario.id_usuario,
      ds_email: usuario.ds_email,
      tp_usuario: 'profissional',
    });

    res.json({
      ok: true,
      msg: 'Login realizado com sucesso',
      token,
      usuario: { id_usuario: usuario.id_usuario, nm_usuario: usuario.nm_usuario, ds_email: usuario.ds_email, tp_usuario: 'profissional' }
    });
  } catch (erro) {
    console.error('Erro ao fazer login:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao fazer login' });
  }
}

export async function listarUsuarios(req, res) {
  try {
    const profissionais = await profissionalRepository.readAll();
    const lista = profissionais.map(p => ({
      id_profissional: p.id_profissional,
      nm_usuario: p.nm_usuario,
      ds_email: p.ds_email,
      ds_profissao: p.ds_profissao,
    }));
    res.json({ ok: true, usuarios: lista });
  } catch (erro) {
    console.error('Erro ao listar usuários:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao listar usuários' });
  }
}

export async function obterUsuario(req, res) {
  try {
    const profissional = await profissionalRepository.readById(req.params.id);
    if (!profissional) {
      return res.status(404).json({ ok: false, erro: 'Usuário não encontrado' });
    }
    const { ds_senha, ...dados } = profissional;
    res.json({ ok: true, usuario: dados });
  } catch (erro) {
    console.error('Erro ao obter usuário:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao obter usuário' });
  }
}

export async function atualizarUsuario(req, res) {
  try {
    const { id } = req.params; // id_profissional
    const {
      nm_usuario, ds_email, ds_senha, ds_telefone,
      ds_logradouro, ds_cidade, ds_estado, ds_cep, ds_profissao,
      ds_resumo, ds_linkedin, nr_experiencia, ds_habilidades, st_disponibilidade,
    } = req.body;

    const profissional = await profissionalRepository.readById(id);
    if (!profissional) {
      return res.status(404).json({ ok: false, erro: 'Usuário não encontrado' });
    }

    const dadosUsuario = { nm_usuario, ds_email, ds_telefone };
    if (ds_senha) {
      dadosUsuario.ds_senha = bcrypt.hashSync(ds_senha, 10);
    }
    await usuarioRepository.update(profissional.id_usuario, dadosUsuario);

    const atualizado = await profissionalRepository.update(id, {
      ds_logradouro, ds_cidade, ds_estado, ds_cep, ds_profissao,
      ds_resumo, ds_linkedin, nr_experiencia, ds_habilidades, st_disponibilidade,
    });

    res.json({ ok: true, msg: 'Usuário atualizado', usuario: atualizado });
  } catch (erro) {
    console.error('Erro ao atualizar usuário:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao atualizar usuário' });
  }
}

export async function deletarUsuario(req, res) {
  try {
    const { id } = req.params; // id_profissional
    const profissional = await profissionalRepository.readById(id);
    if (!profissional) {
      return res.status(404).json({ ok: false, erro: 'Usuário não encontrado' });
    }
    await usuarioRepository.deactivate(profissional.id_usuario);
    res.json({ ok: true, msg: 'Usuário desativado' });
  } catch (erro) {
    console.error('Erro ao deletar usuário:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao deletar usuário' });
  }
}
