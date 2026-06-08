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

## ✨ Funcionalidades

- **Cadastro de Profissional** — perfil completo com área de atuação, habilidades, experiência e disponibilidade
- **Cadastro de Empresa** — conta corporativa com dados de CNPJ e setor de atuação
- **Login com sessão persistente** — autenticação com identificação automática do tipo de conta
- **Catálogo de serviços** — grid responsivo com categorias (Pedreiro, Babá, Eletricista, Faxineira, Garçom, etc.)
- **Listagem de profissionais** — cards com foto, profissão, experiência, localização e disponibilidade
- **Busca de vagas** — empresas publicam oportunidades; profissionais se candidatam
- **Preenchimento automático de endereço** — integração com a API pública [ViaCEP](https://viacep.com.br/)
- **Dicas de carreira** — conteúdo informativo para profissionais melhorarem sua visibilidade
- **Modo claro/escuro** — alternância de tema na interface
- **Design responsivo** — adaptado para mobile (320px+), tablet e desktop

---

## 🛠️ Tecnologias

| Tecnologia | Uso no projeto |
|---|---|
| **HTML5** | Estrutura e arquitetura da informação das páginas |
| **CSS3** | Estilização, responsividade e identidade visual minimalista |
| **JavaScript (vanilla)** | Interatividade, validação de formulários, lógica de sessão |
| **Bootstrap 5.3.2** | Sistema de grid, componentes de UI, menu responsivo |
| **localStorage** | Persistência de dados de usuários e sessões (MVP) |
| **API ViaCEP** | Preenchimento automático de endereço por CEP |

> ⚠️ **Nota técnica:** Esta versão é um protótipo de front-end estático. Senhas são armazenadas em texto simples no `localStorage` — **não recomendado para produção**. O próximo passo é implementar um back-end com banco de dados relacional, hashing de senhas e autenticação via JWT.

---

## 📁 Estrutura do projeto

```
FastWork.github.io/
├── index.html                  # Página principal
├── formu.html                  # Perfil do usuário
├── empregos.html               # Listagem de vagas
├── sobre.html                  # Sobre o projeto
├── ajuda.html                  # Suporte
├── Dev.html                    # Comunidade de desenvolvedores
└── src/
    ├── views/
    │   ├── cadastroem.html     # Cadastro de empresa
    │   ├── contrato.html       # Listagem de profissionais
    │   ├── publicidade.html
    │   ├── investidores.html
    │   ├── fornecedores.html
    │   ├── legal.html
    │   ├── seguranca.html
    │   ├── politicas.html
    │   ├── cookies.html
    │   └── acessibilidade.html
    └── public/
        └── images/             # Imagens e ícones do projeto
```

---

## 🚀 Como executar localmente

Nenhuma dependência de instalação. O projeto é 100% estático.

```bash
# Clone o repositório
git clone https://github.com/DiegoOliveiraz/FastWork.github.io.git

# Acesse a pasta
cd FastWork.github.io

# Abra no navegador
# Basta abrir o arquivo index.html diretamente, ou usar um servidor local:
npx serve .
```

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
| **Douglas de Almeida Santos** | Gerente de Projeto (Líder) |
| **Diego Davi de Oliveira Dias** | Analista de Requisitos |
| **Gabriel Elias Moreira da Silva Araujo** | Desenvolvedor Front-End |
| **Gustavo Gonçalves de Souza** | Designer UI/UX |
| **Lucas Menegaz Rivero** | Especialista em Qualidade (QA) |

---

## 🗺️ Roadmap

- [x] Protótipo estático com HTML, CSS e JS
- [x] Cadastro e autenticação via localStorage
- [x] Catálogo de serviços e listagem de profissionais
- [x] Integração com ViaCEP
- [x] Avaliação de usabilidade (SUS)
- [ ] Desenvolvimento de back-end (Node.js / NestJS)
- [ ] Banco de dados relacional (PostgreSQL)
- [ ] Autenticação segura (bcrypt + JWT + HTTPS)
- [ ] Sistema de avaliação de profissionais (estrelas + comentários)
- [ ] Filtros avançados por categoria, localização e disponibilidade
- [ ] Notificações de candidatura em tempo real

---

## 📄 Documentação

Este projeto foi desenvolvido como trabalho acadêmico interdisciplinar no curso de **Sistemas de Informação — 3º período** do [UNIFOA](https://www.unifoa.edu.br/), em Volta Redonda/RJ.

**Disciplina:** Programação para Todos  
**Professores:** Débora Amorim de Carvalho Paulo · Marcelo Passos dos Santos · Osni Augusto Souza da Silva · Rafael Iacillo Soares · Carlos Eduardo Costa Vieira  
**Coordenador:** Carlos Eduardo Costa Vieira  
**Ano:** 2026

A metodologia adotada foi o **Design Thinking** (Brown, 2009), conduzido em cinco etapas: empatia, definição, ideação, prototipagem e teste.

---

## 📬 Contato

- 🌐 Site: [diegooliveiraz.github.io/FastWork.github.io](https://diegooliveiraz.github.io/FastWork.github.io/)
- 📸 Instagram: [@fast_work2025.1](https://www.instagram.com/fast_work2025.1/)
- 💼 GitHub do dev: [github.com/DiegoOliveiraz](https://github.com/DiegoOliveiraz)

---

<div align="center">

© 2025–2026 FastWork · Todos os direitos reservados · Desenvolvido em Volta Redonda, RJ 🇧🇷

</div>
