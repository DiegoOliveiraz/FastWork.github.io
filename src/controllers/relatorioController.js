import relatorioRepository from "../repositories/relatorioRepository.js";
import { ErroNegocio, lerId, responderErro } from "../utils/erroNegocio.js";

export async function resumoDaEmpresa(req, res) {
  try {
    const resumo = await relatorioRepository.resumoDaEmpresa(req.empresa.id_empresa);
    res.json({ ok: true, resumo });
  } catch (erro) {
    responderErro(res, erro, "resumo da empresa");
  }
}

export async function profissionaisCompativeis(req, res) {
  try {
    const id_vaga = lerId(req.params.id);
    if (id_vaga === null) throw new ErroNegocio(400, "Identificador inválido");
    const profissionais = await relatorioRepository.profissionaisCompativeis({
      id_vaga,
      id_empresa: req.empresa.id_empresa,
    });
    res.json({ ok: true, profissionais });
  } catch (erro) {
    responderErro(res, erro, "profissionais compatíveis");
  }
}

export async function demandaOferta(_req, res) {
  try {
    const profissoes = await relatorioRepository.demandaOferta();
    res.json({ ok: true, profissoes });
  } catch (erro) {
    responderErro(res, erro, "relatório de demanda e oferta");
  }
}
