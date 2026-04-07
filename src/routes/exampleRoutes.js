// Exemplo de Routes
// Define os endpoints da aplicação

import express from 'express';
import { homeController, loginController, dashboardController } from '../controllers/exampleController.js';

const router = express.Router();

// Rotas de páginas
router.get('/', homeController);
router.get('/login', (req, res) => {
  res.sendFile('views/login.html');
});
router.get('/dashboard', dashboardController);

// Rotas de API
router.post('/api/login', loginController);
router.get('/api/dados', (req, res) => {
  res.json({ dados: [] });
});

export default router;
