# 🧪 Guia de Teste - Sistema de Login e Cadastro

## ✅ Mudanças Realizadas

### Problema Identificado e Corrigido:
- ❌ **Problema**: `forceUpdate = true` estava apagando todos os cadastros ao carregar login.html
- ✅ **Solução**: Mudado para `forceUpdate = false` na linha 1535 do login.html

### Melhorias Adicionadas:
- ✅ Adicionados **logs de debug** no console para rastrear problemas
- ✅ Melhorado a função `displayTestAccounts()` com verificações de erro
- ✅ Adicionadas mensagens de erro mais descritivas na autenticação

---

## 🧪 Como Testar o Sistema

### **TESTE 1: Cadastro de Profissional**

**Passo 1: Acessar página de cadastro**
```
http://localhost:3000/src/views/formu.html
```

**Passo 2: Abrir Console do Navegador**
- Pressione `F12` ou `Ctrl+Shift+I`
- Vá para a aba "Console"

**Passo 3: Preencher formulário com dados fictícios**
```
Nome: João 123
Email: joao123@email.com
Senha: 123456
CPF: 123.456.789-10
Telefone: (11) 98765-4321
Endereço: Rua Teste, 123
Cidade: São Paulo
UF: SP
CEP: 01234-567
Profissão: Pedreiro
Experiência: 5+
Habilidades: Especialista em construção
Disponibilidade: Full-time
✓ Aceito os termos
```

**Passo 4: Clicar em "Cadastrar Perfil"**

**Passo 5: Verificar o Console**
Você deve ver algo como:
```
=== CADASTRO DE PROFISSIONAL ===
Dados do formulário: {id: 1717598123456, nome: "João 123", email: "joao123@email.com", ...}
Banco antes: {profissionais: Array(2), empresas: Array(2)}
Banco depois: {profissionais: Array(3), empresas: Array(2)}
localStorage atualizado com sucesso!
```

**Passo 6: Você será redirecionado para /login**
- Se for redirecionado = ✅ Cadastro funcionou!
- Se não for redirecionado = ❌ Há error, verifique o console

---

### **TESTE 2: Login com Conta Cadastrada**

**Nesta janela do navegador com Console aberto:**

**Passo 1: Você já está em /login**
- Verifique se "Profissional" está selecionado (botão azul)

**Passo 2: Procure pela seção "Contas de Teste Disponíveis"**
- Você deve ver a conta "João 123" que acabou de cadastrar
- Ou qualquer outra conta que tenha cadastrado antes

**Passo 3: Se não ver sua conta cadastrada**
- Isso significa que o localStorage não foi salvo
- Verifique o Console para erros

**Passo 4: Clique na conta "João 123"**
- Email e senha serão preenchidos automaticamente
- Clique em "Entrar"

**Passo 5: Verificar o Console**
Você deve ver:
```
=== TENTATIVA DE LOGIN ===
Email: joao123@email.com
Tipo de usuário: profissional
Resultado da autenticação: {success: true, user: {...}}
Login bem-sucedido para: joao123@email.com
```

**Passo 6: Painel de Perfil Exibido**
- Se vir o painel com seus dados = ✅ Login funcionou!
- Se vir erro = ❌ Há problema na autenticação

---

### **TESTE 3: Cadastro de Empresa**

**Passo 1: Acessar página de cadastro**
```
http://localhost:3000/src/views/cadastroem.html
```

**Passo 2: Abrir Console (F12)**

**Passo 3: Preencher com dados fictícios**
```
Nome: Empresa Teste
CNPJ: 12.345.678/0001-99
Email: empresa@teste.com
Telefone: (11) 3456-7890
Senha: 123456
Endereço: Avenida Teste, 456
Setor: Construção
```

**Passo 4: Clicar "Cadastrar Empresa"**

**Passo 5: Verificar Console**
Você deve ver:
```
=== CADASTRO DE EMPRESA ===
Dados do formulário: {id: 1717598..., nome: "Empresa Teste", ...}
localStorage atualizado com sucesso!
```

**Passo 6: Redirecionado para /login**

---

### **TESTE 4: Login com Conta de Empresa**

**Nesta janela com Console aberto:**

**Passo 1: Selecionar "Empresa"** (clique no botão Empresa)

**Passo 2: Procure a conta "Empresa Teste" nos "Contas de Teste"**

**Passo 3: Clique na conta**

**Passo 4: Clique em "Entrar"**

**Passo 5: Verificar Console**
```
=== TENTATIVA DE LOGIN ===
Email: empresa@teste.com
Tipo de usuário: empresa
Resultado da autenticação: {success: true, user: {...}}
```

**Passo 6: Painel de Perfil Exibido com Dados da Empresa**

---

## 🔍 Diagnóstico de Problemas

### **Problema: Conta cadastrada não aparece na lista**

**Possíveis causas:**
1. localStorage foi limpo ao recarregar a página
2. Dados não foram salvos corretamente
3. Há erro no campo email

**Solução:**
1. Abra Console (F12)
2. Digite no Console:
   ```javascript
   JSON.parse(localStorage.getItem('fastwork_users'))
   ```
3. Verifique se seus dados estão lá
4. Se estão: o problema é na exibição (displayTestAccounts)
5. Se não estão: o problema é no cadastro

---

### **Problema: Login não funciona mesmo com conta cadastrada**

**Possíveis causas:**
1. Senha digitada errada
2. Tipo de usuário selecionado errado
3. localStorage corrompido

**Solução:**
1. Verifique no Console:
   ```javascript
   const db = JSON.parse(localStorage.getItem('fastwork_users'));
   console.log("Profissionais:", db.profissionais);
   ```
2. Procure pela conta com o email que você está tentando usar
3. Copie o valor da password da conta e use no login

---

### **Problema: Vejo mensagem "Nenhum usuário cadastrado" mesmo tendo cadastrado**

**Solução:**
1. Significa que forceUpdate estava true e apagou os dados
2. **Já foi corrigido** na versão atual
3. Leia o localStorage no Console para confirmar

---

## 📊 Verificação Completa do localStorage

**Cole no Console (F12) para ver tudo:**

```javascript
// Ver estrutura completa
const dados = JSON.parse(localStorage.getItem('fastwork_users'));
console.log("=== DADOS COMPLETOS ===");
console.log("Total de Profissionais:", dados.profissionais.length);
console.log("Total de Empresas:", dados.empresas.length);
console.log("\nProfissionais:", dados.profissionais);
console.log("\nEmpresas:", dados.empresas);

// Ver sessão atual
const sessao = JSON.parse(localStorage.getItem('fastwork_session'));
console.log("\nSessão Atual:", sessao);
```

---

## ✨ Status Esperado Após Testes

| Teste | Status | Descrição |
|-------|--------|-----------|
| Cadastro Profissional | ✅ | Dados salvos em localStorage |
| Login Profissional | ✅ | Autentica e exibe painel |
| Cadastro Empresa | ✅ | Dados salvos em localStorage |
| Login Empresa | ✅ | Autentica e exibe painel |
| Lista de Contas | ✅ | Mostra contas cadastradas |
| Logout | ✅ | Limpa sessão |
| Editar Dados | ✅ | Atualiza localStorage |
| Excluir Conta | ✅ | Remove de localStorage |

---

## 🐛 Se Ainda Tiver Problemas

**Limpar localStorage e começar do zero:**

```javascript
// Cole no Console:
localStorage.clear();
window.location.reload();
```

Depois:
1. Cadastre novamente
2. Colete logs do console durante todo o processo
3. Compartilhe os logs comigo

---

## 📝 Checklist de Testes

- [ ] Cadastro de profissional funciona
- [ ] Dados aparecem no localStorage
- [ ] Conta aparece na lista de contas de teste
- [ ] Login com conta cadastrada funciona
- [ ] Painel de perfil exibe dados corretos
- [ ] Cadastro de empresa funciona
- [ ] Login de empresa funciona
- [ ] Logout funciona
- [ ] Editar dados funciona
- [ ] Excluir conta funciona

---

**Data:** 5 de junho de 2026  
**Versão:** 2.0 (Com correção de forceUpdate)
