import {Router} from 'express';
import { listarProfissionais } from '../controllers/profissionalController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const profissionalRoutes = Router();

profissionalRoutes.get('/profissionais', authMiddleware.validarToken,listarProfissionais);

export default profissionalRoutes;