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

const empresaRoutes = Router();

// Rotas públicas
empresaRoutes.post('/empresas', cadastrarEmpresa);
empresaRoutes.post('/login/empresa', loginEmpresa);

// Rotas protegidas
empresaRoutes.get('/empresas', authMiddleware.validarToken, listarEmpresas);
empresaRoutes.get('/empresas/:id', authMiddleware.validarToken, obterEmpresa);
empresaRoutes.put('/empresas/:id', authMiddleware.validarToken, atualizarEmpresa);
empresaRoutes.delete('/empresas/:id', authMiddleware.validarToken, deletarEmpresa);

export default empresaRoutes;