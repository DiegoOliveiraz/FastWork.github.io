import { Router } from 'express';
import { cadastrarUsuario } from '../controllers/usuarioController.js';

const usuarioRoutes = Router();

usuarioRoutes.post('/usuarios', cadastrarUsuario);

export default usuarioRoutes;