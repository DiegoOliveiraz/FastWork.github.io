# Estrutura MVC do Projeto

## Organização de Pastas

```
src/
├── controllers/          # Controladores (lógica da aplicação)
│   └── *.js             # Cada arquivo controla uma funcionalidade
├── models/              # Modelos de dados
│   └── *.js             # Estrutura dos dados
├── services/            # Serviços e APIs externas
│   └── APIs.js          # Serviços de requisições
├── routes/              # Rotas da aplicação
│   └── *.js             # Definição de rotas
├── views/               # Templates HTML (visualização)
│   └── *.html           # Arquivos de página
├── public/              # Arquivos estáticos
│   ├── css/             # Estilos CSS
│   ├── js/              # Scripts JavaScript do cliente
│   └── images/          # Imagens da aplicação
└── server.js            # Arquivo principal do servidor
```

## Padrão MVC

- **Model (M)**: Define a estrutura dos dados
  - Localização: `src/models/`
  
- **View (V)**: Apresentação dos dados ao usuário
  - Localização: `src/views/`
  
- **Controller (C)**: Lógica de negócio e comunicação entre Model e View
  - Localização: `src/controllers/`

## Como Usar

1. **Criar uma nova página**:
   - HTML em `views/` (ex: `minhapage.html`)
   - Rota em `routes/` (ex: `routes/minhapage.js`)
   - Controller em `controllers/` (ex: `controllers/minhaController.js`)

2. **Adicionar estilos**:
   - CSS em `public/css/`
   - Referenciar no HTML: `<link rel="stylesheet" href="/css/meuarquivo.css">`

3. **Adicionar scripts**:
   - JS em `public/js/`
   - Referenciar no HTML: `<script src="/js/meuarquivo.js"></script>`

4. **Adicionar imagens**:
   - Salvar em `public/images/`
   - Referenciar: `<img src="/images/minha-imagem.png">`
