import empresaRepository from "../repositories/empresaRepository.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import bcrypt from 'bcryptjs';

export async function cadastrarEmpresa(req, res) {
  try {
    const { nome, cnpj, email, telefone, senha, endereco, setor } = req.body;

    if (!nome || !cnpj || !email || !telefone || !senha) {
      return res.status(400).json({
        ok: false,
        erro: "Campos obrigatórios não preenchidos",
      });
    }

    if (await empresaRepository.emailExiste(email)) {
      return res.status(400).json({
        ok: false,
        erro: "Email já cadastrado",
      });
    }

    if (await empresaRepository.cnpjExiste(cnpj)) {
      return res.status(400).json({
        ok: false,
        erro: "CNPJ já cadastrado",
      });
    }

    if (!validarCNPJ(cnpj)) {
      return res.status(400).json({
        ok: false,
        erro: "CNPJ inválido",
      });
    }

    const senhaCriptografada = bcrypt.hashSync(senha, 10);

    const novaEmpresa = await empresaRepository.create({
      nome,
      cnpj,
      email,
      telefone,
      senha: senhaCriptografada,
      endereco,
      setor,
    });

    res.status(201).json({
      ok: true,
      msg: "Empresa cadastrada com sucesso",
      empresa: { id: novaEmpresa.id, nome: novaEmpresa.nome, email: novaEmpresa.email, tipo: "empresa" }
    });
  } catch (erro) {
    console.error('Erro ao cadastrar empresa:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao cadastrar empresa' });
  }
}

export async function loginEmpresa(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        ok: false,
        erro: "Email e senha são obrigatórios"
      });
    }

    const empresa = await empresaRepository.buscaPorEmail(email);
    if (!empresa) {
      return res.status(401).json({
        ok: false,
        erro: "Credenciais inválidas"
      });
    }

    if (!empresa.ativo) {
      return res.status(401).json({
        ok: false,
        erro: "Empresa desativada"
      });
    }

    if (!bcrypt.compareSync(senha, empresa.senha)) {
      return res.status(401).json({
        ok: false,
        erro: "Credenciais inválidas"
      });
    }

    const token = authMiddleware.gerarToken({ id: empresa.id, email: empresa.email, tipo: "empresa" });

    res.json({
      ok: true,
      msg: "Login realizado com sucesso",
      token,
      empresa: { id: empresa.id, nome: empresa.nome, email: empresa.email, tipo: "empresa" }
    });
  } catch (erro) {
    console.error('Erro ao fazer login da empresa:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao fazer login' });
  }
}

export async function listarEmpresas(req, res) {
  try {
    const empresas = await empresaRepository.readAll();
    const lista = empresas.map(e => ({
      id: e.id,
      nome: e.nome,
      email: e.email,
      setor: e.setor
    }));
    res.json({ ok: true, empresas: lista });
  } catch (erro) {
    console.error('Erro ao listar empresas:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao listar empresas' });
  }
}

export async function obterEmpresa(req, res) {
  try {
    const empresa = await empresaRepository.readById(req.params.id);
    if (!empresa) {
      return res.status(404).json({ ok: false, erro: "Empresa não encontrada" });
    }
    const { senha, ...dados } = empresa;
    res.json({ ok: true, empresa: dados });
  } catch (erro) {
    console.error('Erro ao obter empresa:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao obter empresa' });
  }
}

export async function atualizarEmpresa(req, res) {
  try {
    const { id } = req.params;
    const { nome, cnpj, email, telefone, senha, endereco, setor } = req.body;

    const empresa = await empresaRepository.readById(id);
    if (!empresa) {
      return res.status(404).json({ ok: false, erro: "Empresa não encontrada" });
    }

    const dadosAtualizados = { nome, cnpj, email, telefone, endereco, setor };
    if (senha) {
      dadosAtualizados.senha = bcrypt.hashSync(senha, 10);
    }

    const atualizado = await empresaRepository.update(id, dadosAtualizados);
    res.json({ ok: true, msg: "Empresa atualizada", empresa: atualizado });
  } catch (erro) {
    console.error('Erro ao atualizar empresa:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao atualizar empresa' });
  }
}

export async function deletarEmpresa(req, res) {
  try {
    const { id } = req.params;
    const empresa = await empresaRepository.readById(id);
    if (!empresa) {
      return res.status(404).json({ ok: false, erro: "Empresa não encontrada" });
    }
    await empresaRepository.deactivate(id);
    res.json({ ok: true, msg: "Empresa desativada" });
  } catch (erro) {
    console.error('Erro ao deletar empresa:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao deletar empresa' });
  }
}

function validarCNPJ(cnpj) {
  const numeros = cnpj.replace(/\D/g, "");
  if (numeros.length !== 14) return false;

  let tamanho = numeros.length - 2;
  let numeros_verificacao = numeros.substring(tamanho);
  let nums = numeros.substring(0, tamanho);
  nums = nums.split("").map((el) => Number(el));

  let soma = 0;
  let pos = 0;
  for (let i = tamanho - 7; i <= 1; i++) {
    soma += nums[pos++] * i;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== Number(numeros_verificacao[0])) return false;

  tamanho = tamanho + 1;
  nums = nums.join("") + resultado;
  nums = nums.split("").map((el) => Number(el));
  soma = 0;
  pos = 0;
  for (let i = tamanho - 7; i <= 1; i++) {
    soma += nums[pos++] * i;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== Number(numeros_verificacao[1])) return false;

  return true;
}
