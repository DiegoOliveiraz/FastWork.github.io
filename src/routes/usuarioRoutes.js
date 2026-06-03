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

const usuarioRoutes = Router();

// Rotas públicas
usuarioRoutes.post('/usuarios', cadastrarUsuario);
usuarioRoutes.post('/login', loginUsuario);

// Rotas protegidas
usuarioRoutes.get('/usuarios', authMiddleware.validarToken, listarUsuarios);
usuarioRoutes.get('/usuarios/:id', authMiddleware.validarToken, obterUsuario);
usuarioRoutes.put('/usuarios/:id', authMiddleware.validarToken, atualizarUsuario);
usuarioRoutes.delete('/usuarios/:id', authMiddleware.validarToken, deletarUsuario);

export default usuarioRoutes;