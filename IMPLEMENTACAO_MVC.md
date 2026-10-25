# Guia de Implementação MVC

## ✅ Estrutura Criada

A estrutura do projeto foi reorganizada para o padrão **MVC (Model-View-Controller)**:

```
src/
├── controllers/        → Lógica de negócio
├── models/            → Estrutura dos dados
├── services/          → APIs e serviços externos
├── routes/            → Definição de rotas
├── views/             → Templates HTML
├── public/
│   ├── css/           → Estilos
│   ├── js/            → Scripts do cliente
│   └── images/        → Imagens
└── server.js          → Arquivo principal
```

## 📋 Checklist de Próximos Passos

- [ ] **Conectar rotas ao server.js**
  - Importar as rotas criadas em `routes/` no `server.js`
  
- [ ] **Conectar HTML às rotas**
  - Cada arquivo HTML deve ter uma rota correspondente
  - Ex: `views/login.html` → `routes/` com `GET /login`

- [ ] **Atualizar referências de CSS/JS nos HTML**
  - Caminho anterior: `href="Arquivos.Css/style.css"`
  - Novo caminho: `href="/css/style.css"`
  
- [ ] **Criar models para dados**
  - `Usuario`, `Emprego`, `Fornecedor`, etc.
  
- [ ] **Implementar controllers**
  - Lógica para cada página/funcionalidade
  
- [ ] **Testar servidor**
  - Executar: `npm run Dev`

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento (com reload automático)
npm run Dev

# Servidor rodará em: http://localhost:3000
```

## 📁 Exemplos de Padrão

### Adicionar Nova Página

1. **Criar HTML em `src/views/novapagina.html`**
2. **Criar rota em `src/routes/novapagina.js`**
3. **Criar controller em `src/controllers/novapaginaController.js`**
4. **Importar rota em `src/server.js`:**
   ```javascript
   import novaPaginaRoutes from './routes/novapagina.js';
   app.use('/nova-pagina', novaPaginaRoutes);
   ```

### Referências em HTML

Atualizar todos os `<link>` e `<script>`:

```html
<!-- ❌ Antes -->
<link rel="stylesheet" href="Arquivos.Css/style.css">
<script src="Arquivos.Js/script.js"></script>
<img src="Arquivos.Css/Imagens/foto.avif">

<!-- ✅ Depois -->
<link rel="stylesheet" href="/css/style.css">
<script src="/js/script.js"></script>
<img src="/images/foto.avif">
```

## 🗂️ Documentação Completa

Ver: [ESTRUTURA_MVC.md](./ESTRUTURA_MVC.md)
