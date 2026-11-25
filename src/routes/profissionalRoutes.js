import { Router } from 'express';
import {
  atualizarUsuario,
  deletarUsuario,
} from '../controllers/usuarioController.js';
import { listarProfissionais } from '../controllers/profissionalController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { exigirDono, exigirTipo } from '../middlewares/autorizacao.js';
import profissionalRepository from '../repositories/profissionalRepository.js';
import validarBody from '../middlewares/validarBody.js';
import { usuarioAtualizacaoSchema } from '../schemas/validacaoSchemas.js';

const profissionalRoutes = Router();

profissionalRoutes.get('/profissionais', authMiddleware.validarToken, listarProfissionais);

const exigirDonoDoPerfil = exigirDono(async (req) => {
  const profissional = await profissionalRepository.readById(req.params.id);
  return profissional?.id_usuario;
});

profissionalRoutes.put(
  '/profissionais/:id',
  authMiddleware.validarToken,
  exigirTipo('profissional'),
  exigirDonoDoPerfil,
  validarBody(usuarioAtualizacaoSchema),
  atualizarUsuario,
);
profissionalRoutes.delete(
  '/profissionais/:id',
  authMiddleware.validarToken,
  exigirTipo('profissional'),
  exigirDonoDoPerfil,
  deletarUsuario,
);

export default profissionalRoutes;