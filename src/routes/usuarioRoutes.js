import { Router } from 'express';
import { cadastrarUsuario } from '../controllers/usuarioController.js';

const usuarioroutes = Router();

usuarioroutes.post('/usuarios', cadastrarUsuario);

export default usuarioroutes;