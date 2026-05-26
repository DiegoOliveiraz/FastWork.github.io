import { Router } from 'express';
import { cadastrarEmpresa } from '../controllers/empresaController.js';

const empresaRoutes = Router();

empresaRoutes.post('/empresas', cadastrarEmpresa);

export default empresaRoutes;
