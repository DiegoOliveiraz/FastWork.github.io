<div align="center">

<img src="https://diegooliveiraz.github.io/FastWork.github.io/src/public/images/icons8-instagram-logo-500.png" width="60" alt="FastWork Logo" style="display:none"/>

# ⚡ FastWork

**Conectando profissionais e contratantes no mercado informal de Volta Redonda.**

[![Status](https://img.shields.io/badge/status-protótipo%20acadêmico-yellow)](https://diegooliveiraz.github.io/FastWork.github.io/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.2-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Licença](https://img.shields.io/badge/licença-acadêmica-blue)](./LICENSE)

[🌐 Acessar o site](https://diegooliveiraz.github.io/FastWork.github.io/) · [📋 Ver documentação](#documentação) · [🐛 Reportar problema](https://github.com/DiegoOliveiraz/FastWork.github.io/issues)

</div>

---

## 📌 Sobre o projeto

O **FastWork** é uma plataforma digital hiperlocal desenvolvida para conectar trabalhadores autônomos e contratantes no mercado informal da região de Volta Redonda, RJ.

O projeto nasce de uma realidade concreta: o Brasil tem uma das maiores taxas de informalidade do mundo, mas faltam ferramentas que promovam **transparência, confiança e agilidade** nessas relações de trabalho. O FastWork resolve isso com uma interface simples, direta e focada na experiência do usuário.

> *"A plataforma atua como um facilitador digital de indicações locais — você muito provavelmente conhece quem vai contratar."*

### Por que o FastWork é diferente?

| Critério | GetNinjas | FastWork |
|---|---|---|
| Alcance | Nacional | Hiperlocal — Volta Redonda |
| Modelo de contato | Compra de leads (moedas) | Catálogo aberto e direto |
| Fator confiança | Usuários desconhecidos | Comunidade local |
| Fomento econômico | Plataforma nacional | Circula a economia regional |
| Barreira de entrada | Alta | Baixa — interface minimalista |

---

## ✨ Funcionalidades implementadas

- **Cadastro de Profissional** — perfil completo com área de atuação, habilidades, experiência e disponibilidade
- **Cadastro de Empresa** — conta corporativa com dados de CNPJ e setor de atuação
- **Login com autenticação híbrida** — API com senha protegida por bcrypt e token JWT; o frontend mantém o token no `localStorage`
- **Catálogo de serviços** — grid responsivo com categorias (Pedreiro, Babá, Eletricista, Faxineira, Garçom, etc.)
- **Listagem paginada de profissionais** — filtros por profissão, cidade e disponibilidade
- **CRUD de perfis** — consulta, atualização e desativação de usuários e empresas por API protegida
- **Validação de CNPJ** — verificação no cadastro de empresas
- **Preenchimento automático de endereço** — consulta ao ViaCEP nos cadastros de profissional e empresa
- **CORS e API JSON** — backend preparado para consumo pelo frontend
- **Design responsivo** — adaptado para mobile (320px+), tablet e desktop

---

## 🛠️ Tecnologias

| Tecnologia | Uso no projeto |
|---|---|
| **HTML5** | Estrutura e arquitetura da informação das páginas |
| **CSS3** | Estilização, responsividade e identidade visual minimalista |
| **JavaScript (vanilla)** | Interatividade, validação de formulários e consumo da API |
| **Bootstrap 5.3.x** | Sistema de grid e componentes de UI |
| **Node.js + Express** | Servidor HTTP, páginas e endpoints REST |
| **PostgreSQL + Neon** | Persistência relacional por `@neondatabase/serverless` |
| **bcryptjs** | Hash e verificação de senhas |
| **jsonwebtoken** | Geração e validação de tokens JWT |
| **CORS** | Permissão de acesso à API por clientes externos |
| **localStorage** | Armazenamento do token e dados da sessão no navegador |

> ⚠️ **Nota técnica:** O repositório já contém um backend funcional para usuários, profissionais e empresas, mas ainda não deve ser considerado pronto para produção. É necessário configurar `DATABASE_URL` e `JWT_SECRET`, além de adicionar testes automatizados, autorização por proprietário do recurso e os módulos de vagas/candidaturas.

## 🔌 API disponível

As rotas abaixo estão implementadas em `src/routes/`:

| Método | Endpoint | Acesso | Finalidade |
|---|---|---|---|
| `POST` | `/api/usuarios` | Público | Cadastrar profissional |
| `POST` | `/api/empresas` | Público | Cadastrar empresa |
| `POST` | `/api/login` | Público | Login de profissional |
| `POST` | `/api/login/empresa` | Público | Login de empresa |
| `GET` | `/api/profissionais` | JWT | Listar profissionais com paginação e filtros |
| `GET` | `/api/usuarios` | JWT | Listar profissionais |
| `GET/PUT/DELETE` | `/api/usuarios/:id` | JWT | Consultar, atualizar e desativar profissional |
| `GET` | `/api/empresas` | JWT | Listar empresas |
| `GET/PUT/DELETE` | `/api/empresas/:id` | JWT | Consultar, atualizar e desativar empresa |

Os filtros de profissionais aceitam `page`, `limit`, `profissao`, `cidade` e `disponivel`.

### Integrações externas

- **ViaCEP** — consulta de CEP e preenchimento de logradouro, cidade e UF.
- **GitHub API** — consulta de perfis no painel de APIs.
- **Quotable API** — consulta de citações motivacionais no painel de APIs.
- **Vagas mock** — dados demonstrativos locais no painel; não representam vagas persistidas no banco.

---

## 📁 Estrutura do projeto

```
FastWork.github.io/
├── index.html                  # Página principal
├── package.json                # Scripts e dependências
├── vercel.json                 # Deploy da API na Vercel
└── src/
    ├── app.js                  # Configuração do Express e páginas
    ├── server.js               # Inicialização local
    ├── api/index.js            # Entrada para serverless
    ├── controllers/            # Regras dos endpoints
    ├── database/schema.sql     # Modelo relacional
    ├── database/db.js          # Cliente Neon/PostgreSQL
    ├── middlewares/            # Autenticação JWT
    ├── repositories/           # Consultas ao banco
    ├── routes/                 # Rotas REST
    ├── views/                  # Páginas HTML
    └── public/                 # CSS, JavaScript e imagens
```

---

## 🚀 Como executar localmente

```bash
# Clone o repositório
git clone https://github.com/DiegoOliveiraz/FastWork.github.io.git

# Acesse a pasta
cd FastWork.github.io

# Instale as dependências
npm install

# Configure .env com DATABASE_URL e JWT_SECRET

# Inicie o backend
npm start

# Desenvolvimento com reinício automático
npm run dev
```

O servidor fica disponível em `http://localhost:3000`. Sem as variáveis de ambiente do banco e do JWT, o backend não inicia. A página pode ser aberta diretamente para inspeção visual, mas os cadastros e logins dependem do servidor.

## 📋 Comparação com o PDF

O PDF apresenta a evolução planejada e os entregáveis do projeto. Nem tudo que aparece nele está implementado no repositório atual:

| Item apresentado no PDF | Situação no código |
|---|---|
| Frontend HTML/CSS/JS e Bootstrap | Implementado |
| API Node.js/Express, CORS e JSON | Implementado |
| PostgreSQL/Neon e modelo relacional | Implementado no schema e no cliente de banco |
| Hash de senha com bcrypt e JWT | Implementado |
| Filtros e paginação de profissionais | Implementado |
| ViaCEP | Implementado nos cadastros e no painel de APIs |
| CRUD de vagas e candidaturas | Apenas tabelas no schema; endpoints não implementados |
| Contratos e relacionamentos do diagrama | Não há módulo executável correspondente |
| Testes QSS, Playwright e cobertura de 100% | Não implementados; o script `npm test` ainda falha de propósito |
| Notificações em tempo real/WebSockets | Não implementadas |
| Avaliações por estrelas e comentários | Não implementadas |
| Ciclos Scrum, sprints e papéis | Documentação do processo, não funcionalidade do sistema |

Portanto, o PDF descreve corretamente a direção arquitetural e parte da evolução do projeto, mas não representa integralmente o estado executável atual.

---

## 📊 Avaliação de usabilidade (SUS)

O protótipo foi avaliado pelo método **System Usability Scale (SUS)** com **46 usuários**.

| Métrica | Resultado |
|---|---|
| Pontuação média | **73,97 / 100** |
| Classificação | ✅ **Bom** |
| Principal ponto forte | Facilidade de uso e transmissão de confiança |
| Principal gargalo | Inconsistência na navegação entre telas (22% dos usuários) |

---

## 👥 Equipe

| Integrante | Papel |
|---|---|
| **Diego Davi de Oliveira Dias** | Analista de Requisitos |
| **Gabriel Elias Moreira da Silva Araujo** | Desenvolvedor Front-End |
| **Gustavo Gonçalves de Souza** | Designer UI/UX |
| **Lucas Menegaz Rivero** | Especialista em Qualidade (QA) |

---

## 🗺️ Roadmap

- [x] Protótipo estático com HTML, CSS e JS
- [x] Backend Node.js/Express com API REST
- [x] Banco relacional PostgreSQL/Neon e schema inicial
- [x] Cadastro de profissionais e empresas
- [x] Autenticação com bcrypt e JWT
- [x] CRUD de perfis e filtros paginados de profissionais
- [x] Sessão do frontend com token JWT no localStorage
- [x] Catálogo de serviços e listagem de profissionais
- [x] Avaliação de usabilidade (SUS)
- [x] Integração com ViaCEP nos formulários e no painel
- [ ] CRUD de vagas e candidaturas
- [ ] Módulo de contratos
- [ ] Testes unitários, integração e E2E com relatório de cobertura
- [ ] Sistema de avaliação de profissionais (estrelas + comentários)
- [ ] Filtros avançados por categoria
- [ ] Notificações de candidatura em tempo real com WebSockets
- [ ] Migração completa dos fluxos simulados do frontend para a API

---

## 📄 Documentação

Este projeto foi desenvolvido como trabalho acadêmico interdisciplinar no curso de **Sistemas de Informação — 4º período (2026)** do [UNIFOA](https://www.unifoa.edu.br/), em Volta Redonda/RJ.

**Disciplina:** Programação para Todos  
**Professores:** Débora Amorim de Carvalho Paulo · Marcelo Passos dos Santos · Osni Augusto Souza da Silva · Rafael Iacillo Soares · Carlos Eduardo Costa Vieira  
**Coordenador:** Carlos Eduardo Costa Vieira  
**Ano:** 2026

A metodologia apresentada no PDF combina **Design Thinking** (empatia, definição, ideação, prototipagem e teste) com organização ágil em sprints. O material também registra entregáveis de requisitos, banco de dados, arquitetura, qualidade e avaliação SUS; esses registros devem ser lidos como documentação acadêmica, enquanto a tabela de comparação acima representa o que foi confirmado no código.

---

## 📬 Contato

- 🌐 Site: [diegooliveiraz.github.io/FastWork.github.io](https://diegooliveiraz.github.io/FastWork.github.io/)
- 📸 Instagram: [@fast_work2025.1](https://www.instagram.com/fast_work2025.1/)
- 💼 GitHub do dev: [github.com/DiegoOliveiraz](https://github.com/DiegoOliveiraz)

---

<div align="center">

© 2025–2026 FastWork · Todos os direitos reservados · Desenvolvido em Volta Redonda, RJ 🇧🇷

</div>
