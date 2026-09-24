import usuarioRepository from '../repositories/usuarioRepository.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import bcrypt from 'bcryptjs';

export async function cadastrarUsuario(req, res) {
  try {
    const { nome, email, cpf, telefone, senha, endereco, cidade, uf, cep, profissao, experiencia, habilidades, disponibilidade } = req.body;

    if (!nome || !email || !cpf || !telefone || !senha) {
      return res.status(400).json({
        ok: false,
        erro: 'Campos obrigatórios não preenchidos'
      });
    }

    if (await usuarioRepository.emailExiste(email)) {
      return res.status(400).json({
        ok: false,
        erro: 'Email já cadastrado'
      });
    }

    if (!validarCPF(cpf)) {
      return res.status(400).json({
        ok: false,
        erro: 'CPF inválido'
      });
    }

    if (await usuarioRepository.cpfExiste(cpf)) {
      return res.status(400).json({
        ok: false,
        erro: 'CPF já cadastrado'
      });
    }

    const senhaCriptografada = bcrypt.hashSync(senha, 10);

    const novoUsuario = await usuarioRepository.create({
      nome,
      email,
      cpf,
      telefone,
      senha: senhaCriptografada,
      endereco,
      cidade,
      uf,
      cep,
      profissao,
      experiencia,
      habilidades,
      disponibilidade
    });

    res.status(201).json({
      ok: true,
      msg: 'Usuário cadastrado com sucesso',
      usuario: { id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email, tipo: 'profissional' }
    });
  } catch (erro) {
    console.error('Erro ao cadastrar usuário:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao cadastrar usuário' });
  }
}

export async function loginUsuario(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        ok: false,
        erro: 'Email e senha são obrigatórios'
      });
    }

    const usuario = await usuarioRepository.buscaPorEmail(email);
    if (!usuario) {
      return res.status(401).json({
        ok: false,
        erro: 'Credenciais inválidas'
      });
    }

    if (!usuario.ativo) {
      return res.status(401).json({
        ok: false,
        erro: 'Usuário desativado'
      });
    }

    if (!bcrypt.compareSync(senha, usuario.senha)) {
      return res.status(401).json({
        ok: false,
        erro: 'Credenciais inválidas'
      });
    }

    const token = authMiddleware.gerarToken({ id: usuario.id, email: usuario.email, tipo: "profissional" });

    res.json({
      ok: true,
      msg: 'Login realizado com sucesso',
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: 'profissional' }
    });
  } catch (erro) {
    console.error('Erro ao fazer login:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao fazer login' });
  }
}

export async function listarUsuarios(req, res) {
  try {
    const usuarios = await usuarioRepository.readAll();
    const lista = usuarios.map(u => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      profissao: u.profissao
    }));
    res.json({ ok: true, usuarios: lista });
  } catch (erro) {
    console.error('Erro ao listar usuários:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao listar usuários' });
  }
}

export async function obterUsuario(req, res) {
  try {
    const usuario = await usuarioRepository.readById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ ok: false, erro: 'Usuário não encontrado' });
    }
    const { senha, ...dados } = usuario;
    res.json({ ok: true, usuario: dados });
  } catch (erro) {
    console.error('Erro ao obter usuário:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao obter usuário' });
  }
}

export async function atualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nome, email, cpf, telefone, senha, endereco, cidade, uf, cep, profissao, experiencia, habilidades, disponibilidade } = req.body;

    const usuario = await usuarioRepository.readById(id);
    if (!usuario) {
      return res.status(404).json({ ok: false, erro: 'Usuário não encontrado' });
    }

    const dadosAtualizados = { nome, email, cpf, telefone, endereco, cidade, uf, cep, profissao, experiencia, habilidades, disponibilidade };
    if (senha) {
      dadosAtualizados.senha = bcrypt.hashSync(senha, 10);
    }

    const atualizado = await usuarioRepository.update(id, dadosAtualizados);
    res.json({ ok: true, msg: 'Usuário atualizado', usuario: atualizado });
  } catch (erro) {
    console.error('Erro ao atualizar usuário:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao atualizar usuário' });
  }
}

export async function deletarUsuario(req, res) {
  try {
    const { id } = req.params;
    const usuario = await usuarioRepository.readById(id);
    if (!usuario) {
      return res.status(404).json({ ok: false, erro: 'Usuário não encontrado' });
    }
    await usuarioRepository.deactivate(id);
    res.json({ ok: true, msg: 'Usuário desativado' });
  } catch (erro) {
    console.error('Erro ao deletar usuário:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao deletar usuário' });
  }
}

function validarCPF(cpf) {
  const numeros = cpf.replace(/\D/g, '');
  if (numeros.length !== 11) return false;

  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(numeros.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numeros.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(numeros.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numeros.substring(10, 11))) return false;

  return true;
}
