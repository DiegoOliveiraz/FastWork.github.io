# FastWork API

API RESTful com Node.js, Express, autenticação JWT e CRUD de usuários/empresas.

## Funcionalidades Implementadas

### Autenticação e Autorização (JWT + bcryptjs)
- Senhas criptografadas com bcryptjs
- Tokens JWT com validade de 24h
- Middleware de autenticação para rotas protegidas
- Helmet adiciona cabeçalhos de segurança e CSP; scripts locais e conexões ao ViaCEP são permitidos
- CORS aceita somente a origem definida em `ALLOWED_ORIGIN`; sem variável, requisições cross-origin não são liberadas
- JSON de entrada limitado a 10 KB
- Login e cadastro compartilham um limite de 10 tentativas por IP a cada 15 minutos, com resposta JSON `429`
- O primeiro proxy é considerado confiável para identificar o IP do cliente no deploy da Vercel
- Arquivos estáticos são servidos exclusivamente de `src/public`; as páginas HTML disponíveis são registradas por rotas explícitas
- O serviço de navegador `APIs.js` foi movido de `src/services/` para `src/public/js/`
- Schemas Zod validam login, cadastro e atualizações conforme os limites definidos em `schema.sql`; dados inválidos retornam `400` genérico
- E-mail duplicado retorna `409`; senhas são verificadas e geradas com bcrypt assíncrono

### Usuários
- `POST /api/usuarios` - Cadastro de usuário
- `POST /api/login` - Login de usuário
- `GET /api/usuarios` - Listar todos (requer token)
- `GET /api/usuarios/:id` - Obter usuário (requer token)
- `PUT /api/usuarios/:id` - Atualizar perfil profissional próprio (requer token do proprietário)
- `DELETE /api/usuarios/:id` - Desativar perfil profissional próprio (requer token do proprietário)

### Empresas
- `POST /api/empresas` - Cadastro de empresa
- `POST /api/login/empresa` - Login de empresa
- `GET /api/empresas` - Listar todas (requer token)
- `GET /api/empresas/:id` - Obter empresa (requer token)
- `PUT /api/empresas/:id` - Atualizar empresa própria (requer token do proprietário)
- `DELETE /api/empresas/:id` - Desativar empresa própria (requer token do proprietário)

### Profissionais
- `GET /api/profissionais` - Listar profissionais com paginação (requer token; sem e-mail ou telefone)
- `PUT /api/profissionais/:id` - Atualizar perfil profissional próprio (requer token do proprietário)
- `DELETE /api/profissionais/:id` - Desativar perfil profissional próprio (requer token do proprietário)

As alterações e exclusões respondem `403` quando o token pertence a outro usuário ou a outro tipo de conta. As listagens de usuários e empresas também não retornam e-mail nem telefone.

## Executar
```bash
npm start
```

## Variáveis de Ambiente
Copie `.env.example` para `.env` e configure:
- `JWT_SECRET` - Chave secreta para assinatura dos tokens
- `PORT` - Porta do servidor (opcional)
- `ALLOWED_ORIGIN` - Origem exata autorizada pelo CORS (ex.: `http://localhost:3000`; em produção, use a origem do frontend)