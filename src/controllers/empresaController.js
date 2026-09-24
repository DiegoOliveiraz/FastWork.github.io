import sql from '../database/db.js';
import usuarioRepository from '../repositories/usuarioRepository.js';
import empresaRepository from '../repositories/empresaRepository.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import bcrypt from 'bcryptjs';

export async function cadastrarEmpresa(req, res) {
  try {
    const {
      nm_usuario, ds_email, ds_senha, ds_telefone,
      ds_cnpj, nm_fantasia, nm_razao_social, ds_setor, ds_site,
      ds_endereco, ds_cidade, ds_estado, ds_descricao, st_aceite_termos,
    } = req.body;

    if (!nm_usuario || !ds_email || !ds_senha || !ds_telefone || !ds_cnpj) {
      return res.status(400).json({
        ok: false,
        erro: "Campos obrigatórios não preenchidos",
      });
    }

    if (await usuarioRepository.emailExiste(ds_email)) {
      return res.status(400).json({
        ok: false,
        erro: "Email já cadastrado",
      });
    }

    if (await empresaRepository.cnpjExiste(ds_cnpj)) {
      return res.status(400).json({
        ok: false,
        erro: "CNPJ já cadastrado",
      });
    }

    if (!validarCNPJ(ds_cnpj)) {
      return res.status(400).json({
        ok: false,
        erro: "CNPJ inválido",
      });
    }

    const ds_senha_hash = bcrypt.hashSync(ds_senha, 10);

    // Mesmo padrão do cadastro de profissional: usuarios + empresas
    // gravados atomicamente numa única query via CTE.
    const [novaEmpresa] = await sql`
      WITH novo_usuario AS (
        INSERT INTO usuarios (nm_usuario, ds_email, ds_senha, ds_telefone, tp_usuario)
        VALUES (${nm_usuario}, ${ds_email}, ${ds_senha_hash}, ${ds_telefone}, 'empresa')
        RETURNING id_usuario, nm_usuario, ds_email
      )
      INSERT INTO empresas (
        id_usuario, ds_cnpj, nm_fantasia, nm_razao_social, ds_setor, ds_site,
        ds_endereco, ds_cidade, ds_estado, ds_descricao, st_aceite_termos
      )
      SELECT
        novo_usuario.id_usuario,
        ${ds_cnpj}, ${nm_fantasia ?? null}, ${nm_razao_social ?? null}, ${ds_setor ?? null}, ${ds_site ?? null},
        ${ds_endereco ?? null}, ${ds_cidade ?? null}, ${ds_estado ?? null}, ${ds_descricao ?? null}, ${st_aceite_termos ?? false}
      FROM novo_usuario
      RETURNING
        id_empresa, id_usuario,
        (SELECT nm_usuario FROM novo_usuario) AS nm_usuario,
        (SELECT ds_email FROM novo_usuario) AS ds_email
    `;

    res.status(201).json({
      ok: true,
      msg: "Empresa cadastrada com sucesso",
      empresa: {
        id_usuario: novaEmpresa.id_usuario,
        id_empresa: novaEmpresa.id_empresa,
        nm_usuario: novaEmpresa.nm_usuario,
        ds_email: novaEmpresa.ds_email,
        tp_usuario: "empresa",
      }
    });
  } catch (erro) {
    console.error('Erro ao cadastrar empresa:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao cadastrar empresa' });
  }
}

export async function loginEmpresa(req, res) {
  try {
    const { ds_email, ds_senha } = req.body;

    if (!ds_email || !ds_senha) {
      return res.status(400).json({
        ok: false,
        erro: "Email e senha são obrigatórios"
      });
    }

    const usuario = await usuarioRepository.buscaPorEmail(ds_email);
    if (!usuario || usuario.tp_usuario !== 'empresa') {
      return res.status(401).json({
        ok: false,
        erro: "Credenciais inválidas"
      });
    }

    if (!usuario.st_ativo) {
      return res.status(401).json({
        ok: false,
        erro: "Empresa desativada"
      });
    }

    if (!bcrypt.compareSync(ds_senha, usuario.ds_senha)) {
      return res.status(401).json({
        ok: false,
        erro: "Credenciais inválidas"
      });
    }

    const token = authMiddleware.gerarToken({
      id_usuario: usuario.id_usuario,
      ds_email: usuario.ds_email,
      tp_usuario: "empresa",
    });

    res.json({
      ok: true,
      msg: "Login realizado com sucesso",
      token,
      empresa: { id_usuario: usuario.id_usuario, nm_usuario: usuario.nm_usuario, ds_email: usuario.ds_email, tp_usuario: "empresa" }
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
      id_empresa: e.id_empresa,
      nm_usuario: e.nm_usuario,
      ds_email: e.ds_email,
      ds_setor: e.ds_setor,
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
    const { ds_senha, ...dados } = empresa;
    res.json({ ok: true, empresa: dados });
  } catch (erro) {
    console.error('Erro ao obter empresa:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao obter empresa' });
  }
}

export async function atualizarEmpresa(req, res) {
  try {
    const { id } = req.params; // id_empresa
    const {
      nm_usuario, ds_email, ds_senha, ds_telefone,
      nm_fantasia, nm_razao_social, ds_setor, ds_site,
      ds_endereco, ds_cidade, ds_estado, ds_descricao,
    } = req.body;

    const empresa = await empresaRepository.readById(id);
    if (!empresa) {
      return res.status(404).json({ ok: false, erro: "Empresa não encontrada" });
    }

    const dadosUsuario = { nm_usuario, ds_email, ds_telefone };
    if (ds_senha) {
      dadosUsuario.ds_senha = bcrypt.hashSync(ds_senha, 10);
    }
    await usuarioRepository.update(empresa.id_usuario, dadosUsuario);

    const atualizada = await empresaRepository.update(id, {
      nm_fantasia, nm_razao_social, ds_setor, ds_site, ds_endereco, ds_cidade, ds_estado, ds_descricao,
    });

    res.json({ ok: true, msg: "Empresa atualizada", empresa: atualizada });
  } catch (erro) {
    console.error('Erro ao atualizar empresa:', erro);
    res.status(500).json({ ok: false, erro: 'Erro interno ao atualizar empresa' });
  }
}

export async function deletarEmpresa(req, res) {
  try {
    const { id } = req.params; // id_empresa
    const empresa = await empresaRepository.readById(id);
    if (!empresa) {
      return res.status(404).json({ ok: false, erro: "Empresa não encontrada" });
    }
    await usuarioRepository.deactivate(empresa.id_usuario);
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
