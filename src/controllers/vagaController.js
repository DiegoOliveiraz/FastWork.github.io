import vagaRepository from "../repositories/vagaRepository.js";
import candidaturaRepository from "../repositories/candidaturaRepository.js";
import { ErroNegocio, lerId, responderErro } from "../utils/erroNegocio.js";
import { normalizarTexto, profissaoCompativel } from "../utils/profissoes.js";

const VAGAS_POR_PAGINA = 12;

function idOuErro(valor) {
  const id = lerId(valor);
  if (id === null) throw new ErroNegocio(400, "Identificador inválido");
  return id;
}

// Lista de vagas abertas, para qualquer usuário logado.
// Para profissionais, cada vaga vem marcada com `compativel` (profissão igual) e `ja_candidatou`.
export async function listarVagas(req, res) {
  try {
    const pagina = Math.max(1, Number.parseInt(req.query.pagina, 10) || 1);
    const cidade = typeof req.query.cidade === "string" ? req.query.cidade.trim().slice(0, 100) : "";
    let profissao = typeof req.query.profissao === "string" ? normalizarTexto(req.query.profissao).slice(0, 100) : "";

    const perfil = req.usuarioLogado.tp_usuario === "profissional"
      ? await vagaRepository.buscarProfissionalDoUsuario(req.usuarioLogado.id_usuario)
      : null;

    // "Somente vagas do meu perfil": força o filtro pela profissão cadastrada.
    if (perfil && req.query.compativeis === "true") {
      profissao = normalizarTexto(perfil.ds_profissao) || "(sem profissão)";
    }

    const { vagas, total } = await vagaRepository.listarAbertas({
      profissao: profissao || null,
      cidade: cidade || null,
      limite: VAGAS_POR_PAGINA,
      deslocamento: (pagina - 1) * VAGAS_POR_PAGINA,
      id_profissional: perfil?.id_profissional ?? null,
    });

    res.json({
      ok: true,
      vagas: vagas.map((vaga) => ({
        ...vaga,
        compativel: perfil ? profissaoCompativel(perfil.ds_profissao, vaga.nm_cargo) : null,
      })),
      total,
      pagina,
      por_pagina: VAGAS_POR_PAGINA,
      perfil: perfil ? { ds_profissao: perfil.ds_profissao ?? null } : null,
    });
  } catch (erro) {
    responderErro(res, erro, "listagem de vagas");
  }
}

// Painel da empresa: as vagas dela com contagem de candidaturas por status.
export async function minhasVagas(req, res) {
  try {
    const vagas = await vagaRepository.listarDaEmpresa(req.empresa.id_empresa);
    res.json({ ok: true, vagas });
  } catch (erro) {
    responderErro(res, erro, "listagem das vagas da empresa");
  }
}

export async function criarVaga(req, res) {
  try {
    const dados = { ...req.body, nm_cargo: normalizarTexto(req.body.nm_cargo) };
    if (dados.dt_encerramento && new Date(dados.dt_encerramento) <= new Date()) {
      throw new ErroNegocio(400, "O encerramento deve ser uma data futura");
    }
    const vaga = await vagaRepository.criar(req.empresa.id_empresa, dados);
    res.status(201).json({ ok: true, msg: "Vaga criada com sucesso", vaga });
  } catch (erro) {
    responderErro(res, erro, "criação de vaga");
  }
}

export async function atualizarVaga(req, res) {
  try {
    const vaga = await vagaRepository.atualizar(idOuErro(req.params.id), req.empresa.id_empresa, req.body);
    res.json({ ok: true, msg: "Vaga atualizada", vaga });
  } catch (erro) {
    responderErro(res, erro, "atualização de vaga");
  }
}

export async function encerrarVaga(req, res) {
  try {
    const resultado = await candidaturaRepository.encerrarVaga({
      id_vaga: idOuErro(req.params.id),
      id_empresa: req.empresa.id_empresa,
    });
    res.json({ ok: true, msg: "Vaga encerrada", ...resultado });
  } catch (erro) {
    responderErro(res, erro, "encerramento de vaga");
  }
}
