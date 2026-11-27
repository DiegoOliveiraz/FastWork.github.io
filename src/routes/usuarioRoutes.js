import { Router } from 'express';
import { 
  cadastrarUsuario, 
  loginUsuario,
  listarUsuarios,
  obterUsuario,
  atualizarUsuario,
  deletarUsuario
} from '../controllers/usuarioController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { exigirDono, exigirTipo } from '../middlewares/autorizacao.js';
import profissionalRepository from '../repositories/profissionalRepository.js';
import limiteTentativas from '../middlewares/limiteTentativas.js';
import validarBody from '../middlewares/validarBody.js';
import {
  loginSchema,
  usuarioAtualizacaoSchema,
  usuarioCadastroSchema,
} from '../schemas/validacaoSchemas.js';

const usuarioRoutes = Router();

// Rotas públicas
usuarioRoutes.post(
  '/usuarios',
  limiteTentativas,
  validarBody(usuarioCadastroSchema),
  cadastrarUsuario,
);
usuarioRoutes.post(
  '/login',
  limiteTentativas,
  validarBody(loginSchema),
  loginUsuario,
);

// Rotas protegidas
usuarioRoutes.get('/usuarios', authMiddleware.validarToken, listarUsuarios);
usuarioRoutes.get('/usuarios/:id', authMiddleware.validarToken, obterUsuario);
const exigirDonoDoPerfil = exigirDono(async (req) => {
  const profissional = await profissionalRepository.readById(req.params.id);
  return profissional?.id_usuario;
});

usuarioRoutes.put(
  '/usuarios/:id',
  authMiddleware.validarToken,
  exigirTipo('profissional'),
  exigirDonoDoPerfil,
  validarBody(usuarioAtualizacaoSchema),
  atualizarUsuario,
);
usuarioRoutes.delete(
  '/usuarios/:id',
  authMiddleware.validarToken,
  exigirTipo('profissional'),
  exigirDonoDoPerfil,
  deletarUsuario,
);

export default usuarioRoutes;