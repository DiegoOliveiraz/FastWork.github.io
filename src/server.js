import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import usuarioRoutes from './routes/usuarioRoutes.js';
import empresaRoutes from './routes/empresaRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));

app.use('/api', usuarioRoutes);
app.use('/api', empresaRoutes);

// Rotas HTML
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));
app.get('/formu.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'formu.html')));
app.get('/cadastroem.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'cadastroem.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/validacao.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'validacao.html')));
app.get('/dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard.html')));
app.get('/empregos.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'empregos.html')));
app.get('/sobre.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'sobre.html')));
app.get('/ajuda.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'ajuda.html')));
app.get('/Dev.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'Dev.html')));

app.use((req, res) => res.status(404).send('Página não encontrada'));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
