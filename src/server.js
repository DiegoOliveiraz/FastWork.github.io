import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import empresaRoutes from './routes/empresaRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api', usuarioRoutes);
app.use('/api', empresaRoutes);

app.listen(3000, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
});
// Configuração
// Middleware para garantir charset UTF-8 em arquivos estáticos
// Serve arquivos da pasta public com prefixo /
app.use(express.static(path.join(__dirname, '..'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware global para garantir charset UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', res.getHeader('Content-Type') + '; charset=utf-8');
  next();
});

// View engine (se usar EJS, HBS, etc. descomente)
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// ===== ROTAS =====

// Rota raiz - servir index.html da raiz do projeto
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Rotas de páginas do sistema
app.get('/sobre', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, 'views', 'sobre.html'));
});

app.get('/login', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/ajuda', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, 'views', 'ajuda.html'));
});

app.get('/formu.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, 'views', 'formu.html'));
});

app.get('/cadastroem.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, 'views', 'cadastroem.html'));
});

app.get('/empregos.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, 'views', 'empregos.html'));
});

// Catch-all para outros arquivos HTML em views
app.get('/:filename.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const filename = req.params.filename + '.html';
  res.sendFile(path.join(__dirname, 'views', filename), (err) => {
    if (err) res.status(404).send('Página não encontrada');
  });
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).send('Página não encontrada');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Pressione Ctrl+C para parar`);
});
