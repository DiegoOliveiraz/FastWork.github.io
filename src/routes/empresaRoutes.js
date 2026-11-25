import { Router } from 'express';
import { 
  cadastrarEmpresa,
  loginEmpresa,
  listarEmpresas,
  obterEmpresa,
  atualizarEmpresa,
  deletarEmpresa
} from '../controllers/empresaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { exigirDono, exigirTipo } from '../middlewares/autorizacao.js';
import empresaRepository from '../repositories/empresaRepository.js';
import limiteTentativas from '../middlewares/limiteTentativas.js';
import validarBody from '../middlewares/validarBody.js';
import {
  empresaAtualizacaoSchema,
  empresaCadastroSchema,
  loginSchema,
} from '../schemas/validacaoSchemas.js';

const empresaRoutes = Router();

// Rotas públicas
empresaRoutes.post(
  '/empresas',
  limiteTentativas,
  validarBody(empresaCadastroSchema),
  cadastrarEmpresa,
);
empresaRoutes.post(
  '/login/empresa',
  limiteTentativas,
  validarBody(loginSchema),
  loginEmpresa,
);

// Rotas protegidas
empresaRoutes.get('/empresas', authMiddleware.validarToken, listarEmpresas);
empresaRoutes.get('/empresas/:id', authMiddleware.validarToken, obterEmpresa);
const exigirDonoDaEmpresa = exigirDono(async (req) => {
  const empresa = await empresaRepository.readById(req.params.id);
  return empresa?.id_usuario;
});

empresaRoutes.put(
  '/empresas/:id',
  authMiddleware.validarToken,
  exigirTipo('empresa'),
  exigirDonoDaEmpresa,
  validarBody(empresaAtualizacaoSchema),
  atualizarEmpresa,
);
empresaRoutes.delete(
  '/empresas/:id',
  authMiddleware.validarToken,
  exigirTipo('empresa'),
  exigirDonoDaEmpresa,
  deletarEmpresa,
);

export default empresaRoutes;