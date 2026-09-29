<div align="center">

<img src="https://diegooliveiraz.github.io/FastWork.github.io/src/public/images/icons8-instagram-logo-500.png" alt="FastWork Logo" width="90" />

# :zap: FastWork

**Conectando profissionais e contratantes no mercado informal de Volta Redonda.**

[![Status](https://img.shields.io/badge/status-protótipo%20acadêmico-yellow)](https://diegooliveiraz.github.io/FastWork.github.io/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![SUS](https://img.shields.io/badge/SUS-73,97%20(Bom)-brightgreen)](https://github.com/DiegoOliveiraz/FastWork.github.io)

[:globe_with_meridians: Acessar o site](https://diegooliveiraz.github.io/FastWork.github.io/) · [:bug: Reportar problema](https://github.com/DiegoOliveiraz/FastWork.github.io/issues)

</div>

---

## :pushpin: Sobre o projeto

O **FastWork** é uma plataforma digital hiperlocal que conecta trabalhadores autônomos e contratantes no mercado informal de **Volta Redonda, RJ**.

O Brasil tem uma das maiores taxas de informalidade do mundo, mas faltam ferramentas que tragam **transparência, confiança e agilidade** para essas relações de trabalho. O FastWork responde a isso com uma interface minimalista, catálogo aberto e foco na comunidade local.

> *A plataforma atua como um facilitador digital de indicações locais: você muito provavelmente conhece quem vai contratar.*

**Objetivo geral:** desenvolver uma plataforma digital que facilite a interação entre contratantes e prestadores de serviços informais, promovendo transparência, segurança e eficiência.

### Por que o FastWork é diferente?

| Critério            | GetNinjas                | FastWork                    |
| ------------------- | ------------------------ | --------------------------- |
| Alcance             | Nacional                 | Hiperlocal (Volta Redonda)  |
| Modelo de contato   | Compra de leads (moedas) | Catálogo aberto e direto    |
| Fator confiança     | Usuários desconhecidos   | Comunidade local            |
| Fomento econômico   | Plataforma nacional      | Circula a economia regional |
| Barreira de entrada | Alta                     | Baixa (interface simples)   |

---

## :sparkles: Atualizações desta versão

| Área | O que mudou |
| ---- | ----------- |
| **Persistência** | Cadastros e dados da plataforma agora são salvos no **banco de dados PostgreSQL** (Neon). O `localStorage` deixou de ser usado como armazenamento |
| **Back-end** | API em **Node.js + Express** (CORS e configuração via variáveis de ambiente), com deploy serverless na **Vercel** |
| **Banco de dados** | **PostgreSQL hospedado na Neon**, acessado via `pg` e `@neondatabase/serverless` |
| **Segurança** | Dependências `bcryptjs` (hash de senha) e `jsonwebtoken` (JWT) no back-end |
| **Modelagem** | Modelo de Entidades e Relacionamentos (ER) como base do banco relacional |
| **Gestão** | Projeto conduzido com **Scrum**: 4 Sprints entre 10/08/2026 e 28/09/2026, Product Backlog priorizado e Kanban no GitHub Projects |
| **Requisitos** | Backlog formal: RF-001 a RF-010, RNF-001 a RNF-003 e 5 histórias de usuário. **RF-006** e **RF-008** evoluíram para a versão 1.1 |
| **Contratação** | Fluxos de candidatura (RF-009) e oferta direta (RF-010), com contrato eletrônico |
| **Validação** | Teste SUS com 46 usuários: média **73,97 (Bom)** |

> :information_source: O teste SUS foi aplicado sobre a versão anterior do protótipo, ainda com dados no navegador. A nota reflete a usabilidade da interface, não a integração com o banco.

---

## :sparkles: Funcionalidades

- **Cadastro de Profissional** (RF-001): dados pessoais, área de atuação, habilidades, experiência e disponibilidade, salvos no banco
- **Cadastro de Empresa** (RF-002): dados corporativos (CNPJ, razão social) e acesso, salvos no banco
- **Login com sessão** (RF-003): profissionais e empresas, com e-mail e senha
- **Endereço automático por CEP** (RF-004): integração com a API [ViaCEP](https://viacep.com.br/)
- **Catálogo de categorias** (RF-005): grid responsivo (Pedreiro, Babá, Eletricista, Faxineira, Garçom etc.)
- **Listagem de profissionais** (RF-006, v1.1): cards com foto, profissão, experiência, localização e disponibilidade
- **Busca de vagas** (RF-007): vagas ativas visíveis ao trabalhador autenticado
- **Publicação de vagas** (RF-008, v1.1): empresas autenticadas publicam oportunidades
- **Candidatura pelo trabalhador** (RF-009): carta de apresentação e contrato eletrônico em caso de aceite
- **Oferta direta pela empresa** (RF-010): carta de oferta e contrato eletrônico em caso de aceite
- **Dicas de carreira**: conteúdo para o profissional melhorar sua visibilidade
- **Modo claro/escuro** e **design responsivo** (mobile 320px+, tablet 768px+, desktop 1024px+)

---

## :building_construction: Arquitetura

| Camada | Tecnologia | Função |
| ------ | ---------- | ------ |
| **Front-end** | HTML5, CSS3, JavaScript, Bootstrap 5 | Interface, navegação e responsividade |
| **Back-end** | Node.js, Express, CORS, dotenv | API da plataforma, configurada por variáveis de ambiente |
| **Banco de dados** | PostgreSQL (Neon), `pg`, `@neondatabase/serverless` | Persistência relacional dos cadastros e demais dados |
| **Autenticação** | `bcryptjs`, `jsonwebtoken` | Hash de senhas e tokens JWT |
| **Publicação** | GitHub Pages (front-end), Vercel (API serverless) | Hospedagem e deploy |

---

## :file_folder: Estrutura do projeto

```
FastWork.github.io/
├── index.html                  # Página principal
├── formu.html                  # Perfil do usuário
├── empregos.html               # Listagem de vagas
├── sobre.html                  # Sobre o projeto
├── ajuda.html                  # Suporte
├── Dev.html                    # Comunidade de desenvolvedores
├── package.json                # Dependências do back-end
├── .env.example                # Modelo de variáveis de ambiente
└── src/
    ├── views/
    │   ├── cadastroem.html     # Cadastro de empresa
    │   ├── contrato.html       # Listagem de profissionais
    │   └── ...                 # Páginas institucionais e legais
    └── public/
        └── images/             # Imagens e ícones
```

---

## :rocket: Como executar

```bash
# Clonar o repositório
git clone https://github.com/DiegoOliveiraz/FastWork.github.io.git
cd FastWork.github.io

# Instalar dependências
npm install

# Criar o arquivo de ambiente a partir do modelo
cp .env.example .env
```

Preencha o `.env` com:

| Variável | Descrição |
| -------- | --------- |
| String de conexão do banco | URL do PostgreSQL na Neon |
| Segredo do JWT | Chave usada para assinar os tokens |
| Porta do servidor | Porta local da API |

> Os nomes exatos das variáveis estão no arquivo `.env.example`. **Nunca** faça commit do `.env`.

Para ver só o front-end, basta abrir o `index.html` no navegador ou usar `npx serve .`.

---

## :bar_chart: Avaliação de usabilidade (SUS)

Aplicada via Google Forms (10 perguntas padrão, escala Likert), de forma remota e assíncrona, durante a Sprint 3 (05/09 a 19/09/2026), com amostragem por conveniência.

| Métrica | Resultado |
| ------- | --------- |
| Avaliações | **46 usuários** |
| Pontuação média | **73,97 / 100** |
| Classificação | :white_check_mark: **Bom** |
| Ponto forte | Facilidade de uso e confiança na plataforma |
| Principal gargalo | Inconsistência de navegação entre telas (**22%** dos usuários), causada pela falta de padronização visual |

---

## :arrows_counterclockwise: Gestão ágil (Scrum)

**Metodologia combinada:** Design Thinking (concepção) + Scrum (gestão) + SUS (avaliação).

| Sprint | Período | Objetivo | Principais entregas |
| ------ | ------- | -------- | ------------------- |
| **1** | 10/08 – 21/08/2026 | Empatia e definição | Pesquisa com 35 participantes, requisitos, regras de negócio, Product Backlog inicial |
| **2** | 22/08 – 04/09/2026 | Ideação e prototipagem | Arquitetura de informação, telas, início do front-end |
| **3** | 05/09 – 19/09/2026 | Desenvolvimento, teste e validação | Protótipo funcional e teste SUS |
| **4** | 20/09 – 28/09/2026 | Refinamento e finalização | Revisão de requisitos (RF-006 e RF-008 v1.1), refinamento do backlog, documentação |

**Ferramentas:** GitHub Projects (Kanban: A Fazer, Em Andamento, Concluído), Google Forms (SUS), mensagens e chamadas rápidas (alinhamentos).

**Priorização:** prioridade **Alta** para os fluxos centrais (cadastro, autenticação, catálogo, vagas, candidatura e contrato) e para os 3 requisitos não funcionais. Prioridade **Média** para o preenchimento de endereço por CEP (RF-004).

---

## :busts_in_silhouette: Equipe

| Integrante | Função no projeto | Papel no Scrum |
| ---------- | ----------------- | -------------- |
| **Diego Davi de Oliveira Dias** | Analista de Requisitos | Product Owner |
| **Gabriel Elias Moreira da Silva Araujo** | Gerente de Projeto e Desenvolvedor Front-End | Scrum Master e Time de Desenvolvimento |
| **Gustavo Gonçalves de Souza** | Designer UI/UX | Time de Desenvolvimento |
| **Lucas Menegaz Rivero** | Especialista em Qualidade (QA) | Time de Desenvolvimento |

---

## :world_map: Roadmap

**Concluído**

- [x] Protótipo com HTML, CSS e JavaScript
- [x] Catálogo de serviços e listagem de profissionais
- [x] Integração com ViaCEP
- [x] Fluxos de vagas, candidatura e oferta
- [x] Modelo ER do banco de dados
- [x] Back-end em Node.js + Express
- [x] Banco PostgreSQL na Neon com cadastros salvos no banco
- [x] Avaliação de usabilidade (SUS: 73,97)
- [x] Revisão do backlog (RF-006 e RF-008 v1.1)

**Próximas etapas**

- [ ] Autenticação segura completa: hash com bcrypt, JWT, HTTPS e proteção contra XSS/CSRF
- [ ] Padronizar os elementos visuais entre as telas (corrigir a inconsistência de navegação apontada no SUS)
- [ ] Validar geração e assinatura do contrato eletrônico em ambiente real (RF-009 e RF-010)
- [ ] Sistema de avaliação de profissionais (1 a 5 estrelas e comentário)
- [ ] Filtros avançados por categoria, localização e disponibilidade
- [ ] Testes de usabilidade menores a cada Sprint

---

## :page_facing_up: Documentação acadêmica

Projeto desenvolvido no curso de **Sistemas de Informação** do [UNIFOA](https://www.unifoa.edu.br/), em Volta Redonda/RJ.

| Etapa | Disciplina | Documento |
| ----- | ---------- | --------- |
| 3º período | Programação para Todos | Documentação original do protótipo (Design Thinking) |
| 4º período | Gerenciamento Ágil de Sistemas (Prof. Leonardo Dias da Silva) | Relatório Técnico: Aplicação da Metodologia Ágil no Projeto |

**Ano:** 2026

---

## :incoming_envelope: Contato

- :globe_with_meridians: Site: [diegooliveiraz.github.io/FastWork.github.io](https://diegooliveiraz.github.io/FastWork.github.io/)
- :camera: Instagram: [@fast_work2025.1](https://www.instagram.com/fast_work2025.1/)
- :briefcase: GitHub do dev: [github.com/DiegoOliveiraz](https://github.com/DiegoOliveiraz)

---

<div align="center">

© 2025–2026 FastWork · Desenvolvido em Volta Redonda, RJ :brazil:

</div>
