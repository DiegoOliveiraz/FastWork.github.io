# FastWork API

API RESTful com Node.js, Express, autenticação JWT e CRUD de usuários/empresas.

## Funcionalidades Implementadas

### Autenticação e Autorização (JWT + bcryptjs)
- Senhas criptografadas com bcryptjs
- Tokens JWT com validade de 24h
- Middleware de autenticação para rotas protegidas

### Usuários
- `POST /api/usuarios` - Cadastro de usuário
- `POST /api/login` - Login de usuário
- `GET /api/usuarios` - Listar todos (requer token)
- `GET /api/usuarios/:id` - Obter usuário (requer token)
- `PUT /api/usuarios/:id` - Atualizar usuário (requer token)
- `DELETE /api/usuarios/:id` - Desativar usuário (requer token)

### Empresas
- `POST /api/empresas` - Cadastro de empresa
- `POST /api/login/empresa` - Login de empresa
- `GET /api/empresas` - Listar todas (requer token)
- `GET /api/empresas/:id` - Obter empresa (requer token)
- `PUT /api/empresas/:id` - Atualizar empresa (requer token)
- `DELETE /api/empresas/:id` - Desativar empresa (requer token)

## Executar
```bash
npm start
```

## Variáveis de Ambiente
Copie `.env.example` para `.env` e configure:
- `JWT_SECRET` - Chave secreta para assinatura dos tokens
- `PORT` - Porta do servidor (opcional)