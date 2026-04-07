import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Configuração
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine (se usar EJS, HBS, etc. descomente)
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// ===== ROTAS =====

// Rota raiz - servir index.html da raiz do projeto
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Rotas de páginas do sistema
app.get('/sobre', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'sobre.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/ajuda', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'ajuda.html'));
});

app.get('/formu.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'formu.html'));
});

app.get('/cadastroem.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cadastroem.html'));
});

app.get('/empregos.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'empregos.html'));
});

// Catch-all para outros arquivos HTML em views
app.get('/:filename.html', (req, res) => {
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
