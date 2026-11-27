import candidaturaRepository from "../repositories/candidaturaRepository.js";
import { ErroNegocio, lerId, responderErro } from "../utils/erroNegocio.js";

function idOuErro(valor) {
  const id = lerId(valor);
  if (id === null) throw new ErroNegocio(400, "Identificador inválido");
  return id;
}

export async function candidatar(req, res) {
  try {
    const candidatura = await candidaturaRepository.candidatar({
      id_vaga: idOuErro(req.params.id),
      profissional: req.profissional,
      carta: req.body.ds_carta_apresentacao,
    });
    res.status(201).json({ ok: true, msg: "Candidatura enviada com sucesso", candidatura });
  } catch (erro) {
    responderErro(res, erro, "candidatura");
  }
}

export async function minhasCandidaturas(req, res) {
  try {
    const candidaturas = await candidaturaRepository.listarDoProfissional(req.profissional.id_profissional);
    res.json({ ok: true, candidaturas });
  } catch (erro) {
    responderErro(res, erro, "listagem de candidaturas");
  }
}

export async function listarCandidatos(req, res) {
  try {
    const candidatos = await candidaturaRepository.listarPorVaga({
      id_vaga: idOuErro(req.params.id),
      id_empresa: req.empresa.id_empresa,
    });
    res.json({ ok: true, candidatos });
  } catch (erro) {
    responderErro(res, erro, "listagem de candidatos");
  }
}

export async function analisarCandidatura(req, res) {
  try {
    const candidatura = await candidaturaRepository.marcarEmAnalise({
      id_candidatura: idOuErro(req.params.id),
      id_empresa: req.empresa.id_empresa,
    });
    res.json({ ok: true, msg: "Candidatura em análise", candidatura });
  } catch (erro) {
    responderErro(res, erro, "análise de candidatura");
  }
}

export async function aprovarCandidatura(req, res) {
  try {
    const resultado = await candidaturaRepository.aprovarCandidato({
      id_candidatura: idOuErro(req.params.id),
      id_empresa: req.empresa.id_empresa,
    });
    res.json({ ok: true, msg: "Candidato aprovado e vaga encerrada", ...resultado });
  } catch (erro) {
    responderErro(res, erro, "aprovação de candidato");
  }
}
