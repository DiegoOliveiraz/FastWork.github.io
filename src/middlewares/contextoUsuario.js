// Depois do JWT e do exigirTipo(), descobre QUEM é a empresa/o profissional dono da conta
// e deixa em req.empresa / req.profissional. Também recusa contas desativadas.
import vagaRepository from "../repositories/vagaRepository.js";
import { responderErro } from "../utils/erroNegocio.js";

function carregar(buscar, propriedade, rotulo) {
  return async (req, res, next) => {
    try {
      const encontrado = await buscar(req.usuarioLogado.id_usuario);
      if (!encontrado) {
        return res.status(403).json({ ok: false, erro: `Perfil de ${rotulo} não encontrado ou conta desativada` });
      }
      req[propriedade] = encontrado;
      next();
    } catch (erro) {
      responderErro(res, erro, `verificação do perfil de ${rotulo}`);
    }
  };
}

export const carregarEmpresa = carregar(
  (id) => vagaRepository.buscarEmpresaDoUsuario(id), "empresa", "empresa",
);
export const carregarProfissional = carregar(
  (id) => vagaRepository.buscarProfissionalDoUsuario(id), "profissional", "profissional",
);
