# Guia de Uso - Sistema Unificado de Login e Cadastro

## 📋 Resumo das Mudanças

O sistema de login e cadastro foi completamente unificado e agora funciona através do **localStorage** do navegador, permitindo cadastro e login sem necessidade de servidor remoto.

---

## 🎯 Fluxo de Funcionamento

### **1. CADASTRO DE PROFISSIONAL** (`/src/views/formu.html`)

**Acesso:**
- Link: `http://localhost:3000/src/views/formu.html`
- Pelo Login: Selecionar "Profissional" → "Cadastre-se como Profissional"

**Dados Salvos:**
- Nome completo, Email, Senha
- CPF, Telefone, Endereço
- Cidade, UF, CEP
- Profissão, Experiência, Habilidades, Disponibilidade

**Validações:**
- Email deve ser único
- Formulário valida campos obrigatórios
- Máscara automática para CPF, Telefone e CEP

**Resultado:**
- Dados salvos em `localStorage['fastwork_users'].profissionais[]`
- Redirecionamento automático para login

---

### **2. CADASTRO DE EMPRESA** (`/src/views/cadastroem.html`)

**Acesso:**
- Link: `http://localhost:3000/src/views/cadastroem.html`
- Pelo Login: Selecionar "Empresa" → "Cadastre-se como Empresa"

**Dados Salvos:**
- Nome da empresa, Email, Senha
- CNPJ, Telefone
- Endereço, Setor de atuação

**Validações:**
- Email deve ser único
- CNPJ deve ser único
- Formulário valida campos obrigatórios
- Máscara automática para CNPJ e Telefone

**Resultado:**
- Dados salvos em `localStorage['fastwork_users'].empresas[]`
- Redirecionamento automático para login

---

### **3. LOGIN UNIFICADO** (`/login`)

**Acesso:**
- URL: `http://localhost:3000/login`

**Fluxo:**
1. **Selecionar Tipo de Usuário:**
   - Botão "Profissional" (padrão)
   - Botão "Empresa"

2. **Preencher Credenciais:**
   - Email
   - Senha

3. **Entrar:**
   - Sistema busca no localStorage
   - Se encontrar → Exibe painel de perfil
   - Se não encontrar → Mostra erro

**Contas de Teste Disponíveis:**

**Profissionais:**
| Email | Senha | Profissão |
|-------|-------|-----------|
| joao@email.com | 123456 | Pedreiro |
| maria@email.com | 123456 | Eletricista |

**Empresas:**
| Email | Senha | Nome |
|-------|-------|------|
| contato@abc.com | 123456 | ABC Construções |
| contato@tech.com | 123456 | Tech Solutions |

---

## 👤 Painel de Perfil (Após Login)

Ao fazer login com sucesso, o usuário vê um painel com:

### **Informações Exibidas:**
- Avatar (iniciais do nome)
- Nome completo
- Tipo de usuário (Profissional ou Empresa)
- Dados cadastrados relevantes

### **Funcionalidades:**

#### **1. Editar Dados (RF04)**
- Clique em "Editar dados"
- Modifique qualquer campo
- Campos alterados ficam destacados em azul
- Informe a senha atual para confirmar
- Salve as alterações

#### **2. Excluir Conta (RF05)**
- Clique em "Excluir conta"
- Confirme informe a senha
- Conta será deletada permanentemente
- Será redirecionado para login

#### **3. Fazer Logout**
- Clique no ícone de logout (seta para fora)
- Sessão será encerrada
- Redirecionado para tela de login

---

## 🔧 Estrutura de Dados no localStorage

### **Chave Implementada:** `fastwork_users`

```javascript
{
  "profissionais": [
    {
      "id": 1234567890,
      "nome": "João Silva",
      "email": "joao@email.com",
      "senha": "123456",
      "cpf": "123.456.789-00",
      "telefone": "(11) 98765-4321",
      "endereco": "Rua X, 123",
      "cidade": "São Paulo",
      "uf": "SP",
      "cep": "01234-567",
      "profissao": "Pedreiro",
      "experiencia": "5+",
      "habilidades": "...",
      "disponibilidade": "Full-time",
      "created_at": "2025-06-05T10:30:00Z",
      "updated_at": "2025-06-05T15:45:00Z"
    }
  ],
  "empresas": [
    {
      "id": 1234567891,
      "nome": "ABC Construções",
      "email": "contato@abc.com",
      "senha": "123456",
      "cnpj": "12.345.678/0001-90",
      "telefone": "(11) 3456-7890",
      "endereco": "Avenida Y, 456",
      "setor": "Construção",
      "created_at": "2025-06-05T10:30:00Z",
      "updated_at": "2025-06-05T15:45:00Z"
    }
  ]
}
```

### **Chave de Sessão:** `fastwork_session`
Armazena o usuário logado atualmente (dados sem a senha).

---

## ✨ Recursos Adicionais

### **1. Tema Claro/Escuro**
- Botão no topo direito da tela
- Preferência salva em `localStorage['theme']`
- Automático ao recarregar a página

### **2. Validação de Formulários**
- Mascara automática de CPF, CNPJ, Telefone e CEP
- Validação em tempo real
- Erros destacados em vermelho

### **3. Contas de Teste**
- Pré-carregadas no localStorage
- Clique para preencher automaticamente o formulário de login
- Senhas: `123456` para todas

---

## 🧪 Como Testar

### **Teste 1: Cadastro de Profissional**
1. Acesse `http://localhost:3000/src/views/formu.html`
2. Preencha todos os campos (use dados fictícios)
3. Clique em "Cadastrar Perfil"
4. Você será redirecionado para login
5. Selecione "Profissional"
6. Insira o email e senha cadastrados
7. Você verá o painel de perfil com seus dados

### **Teste 2: Cadastro de Empresa**
1. Acesse `http://localhost:3000/src/views/cadastroem.html`
2. Preencha todos os campos (use dados fictícios)
3. Clique em "Cadastrar Empresa"
4. Você será redirecionado para login
5. Selecione "Empresa"
6. Insira o email e senha cadastrados
7. Você verá o painel de perfil com dados da empresa

### **Teste 3: Login com Conta de Teste**
1. Acesse `http://localhost:3000/login`
2. Na seção "Contas de Teste Disponíveis"
3. Clique em "João Silva" (profissional)
4. Clique em "Entrar"
5. Você verá o painel com dados de João
6. Clique em logout (seta para fora)

### **Teste 4: Editar Dados**
1. Faça login
2. Clique em "Editar dados"
3. Modifique algum campo
4. Observe que fica em azul (campo alterado)
5. Informe sua senha atual
6. Clique em "Salvar alterações"
7. Você verá a confirmação e os dados atualizados

### **Teste 5: Excluir Conta**
1. Faça login
2. Clique em "Excluir conta"
3. Leia o aviso
4. Informe a senha
5. Clique em "Excluir permanentemente"
6. A conta será deletada
7. Será redirecionado para login

---

## 📝 Notas Importantes

- ✅ Todos os dados são armazenados no **localStorage** do navegador
- ✅ Os dados persistem entre recarregamentos de página
- ✅ Limpar cache do navegador apagará todos os dados
- ✅ Cada navegador/computador tem seu próprio localStorage
- ✅ As contas de teste são recarregadas ao limpar dados
- ⚠️ Não use em produção com dados sensíveis (localStorage é inseguro)

---

## 🚀 Próximos Passos (Sugestões)

Para um sistema em produção, considere:
1. Migrar do localStorage para um banco de dados real (MongoDB, PostgreSQL, etc.)
2. Implementar autenticação com tokens JWT
3. Criptografar senhas com bcrypt (já implementado no backend)
4. Adicionar autenticação de dois fatores (2FA)
5. Implementar recuperação de senha por email
6. Adicionar verificação de email

---

**Última atualização:** 5 de junho de 2026
**Sistema:** FastWork - Plataforma de Trabalho
