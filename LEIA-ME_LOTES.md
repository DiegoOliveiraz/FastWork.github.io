# Lotes 1, 2, 4 e 7: o que mudou e como aplicar

## Como aplicar (5 minutos)
Este zip é a pasta do projeto completa, sem `.env` e sem `node_modules`. Na sua cópia local do repositório:

```bash
git checkout -b chore/lotes-1-2-4-7
# 1) apague tudo que não é .git e .env (seu .env local continua intacto), depois copie o conteúdo do zip
# 2) registre as remoções
git add -A
git rm --cached .env          # tira o .env do versionamento (o arquivo local fica)
npm install                   # o package-lock.json foi regenerado
npm run dev                   # abra http://localhost:3000 e navegue pelo rodapé
git commit -m "Lotes 1, 2, 4 e 7: Bootstrap local, remove código morto, páginas institucionais unificadas"
git push -u origin chore/lotes-1-2-4-7   # abra o Pull Request (usa o modelo novo)
```

**Atenção:** `git rm --cached .env` só tira o arquivo dos próximos commits. As credenciais continuam no histórico. O Lote 0 (trocar senha do Neon e JWT_SECRET) segue pendente e é com você.

## Lote 1: Security
- Bootstrap 5.3.8 e Bootstrap Icons 1.11.3 agora vêm de `src/public/vendor/` (sem CDN, sem SRI). Afeta todos os HTMLs restantes.
- `innerHTML` removido de `login.html` (e-mail vindo do servidor) e de `script.js` (cards de serviço). Agora usa `textContent`/`createElement`.
- Correção do relatório anterior: os `target="_blank"` já tinham `rel="noopener noreferrer"`. A única exceção era `validacao.html`, que foi removido.

## Lote 2: Reliability
- Removidos `dashboard.html` (quebrado: `authSystem` nunca definido e variáveis corrompidas como `sessãonsList`), `validacao.html` (órfão) e os 5 `fix_*.py`.
- URLs antigas (`/dashboard.html`, `/validacao.html`) redirecionam para a home.

## Lote 4: Duplicação
- 11 páginas institucionais viraram **uma**: `src/views/institucional.html?pagina=<chave>`. O texto fica em `src/public/js/paginas-institucionais.js`. Página nova = uma entrada nesse arquivo.
- Rodapé único em `src/public/js/rodape.js`, usado por 7 páginas. Os rodapés agora são iguais em todas (antes, algumas não tinham Cookies e Acessibilidade).
- Script dos cadastros extraído para `src/public/js/cadastro-comum.js` (máscaras, CEP, envio).
- Estilo do fundo escuro movido para `src/public/css/paginas.css`.
- Apagados: `PaginaSobre.html`, `desenvolvedores.html` (duplicatas sem nenhum link), 4 CSS sem referência, `exampleController/Routes`, `usuarioModel`, `usuarios.json`, `empresas.json`.
- URLs antigas de todas as páginas removidas redirecionam (301) para as novas.
- Medição local com jscpd (mesma ideia do Sonar): **18,6% → 3,05%**. O número do Sonar pode diferir um pouco; confirme na reanálise.

## Lote 7: Repositório
- `api/index.js` na raiz com o import correto (`vercel.json` já apontava para ele; em `src/api/` o import `../src/app.js` estava errado). **Confirme que o deploy da Vercel continua funcionando.**
- `.gitignore` limpo (sem `src/server.js`, que é versionado). `snake.yml` removido (é de perfil do GitHub, não do produto).
- `.env.example` agora inclui `DATABASE_URL`.
- `package.json`: removido o pacote `fs`, `poku` movido para devDependencies, URLs do repositório corrigidas. Lockfile regenerado.
- Novos: `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/`, `CONTRIBUTING.md`, `sonar-project.properties` (exclui `vendor/` da análise), `docs/` (os 5 `.md` antigos).

## Classes do layout novo (institucional.html e rodape.js)
| Classe | O que faz |
|---|---|
| `d-flex flex-column` (body) | Coloca navbar, conteúdo e rodapé em coluna para o rodapé ficar embaixo |
| `flex-grow-1` (main) | O conteúdo ocupa o espaço livre e empurra o rodapé |
| `mt-auto` (footer) | Margem superior automática: cola o rodapé no fim da tela |
| `container` | Centraliza e limita a largura, com margens laterais |
| `py-5`, `mb-5`, `pt-5`, `pb-4` | Espaçamento vertical (padding/margin) em múltiplos de 0,25 rem |
| `text-center`, `text-uppercase`, `fw-semibold`/`fw-bold` | Alinhamento, caixa alta e peso da fonte |
| `display-5`, `lead`, `h4`, `fs-4` | Tamanhos de título e texto de destaque |
| `text-white-50`, `text-primary`, `text-light` | Cores do texto: branco 50%, azul do tema e claro |
| `row g-4` + `col-md-4`/`col-md-6`/`col-12` | Grade: `g-4` dá espaço entre colunas; `col-md-4` = 3 por linha, `col-md-6` = 2, `col-12` = linha inteira (a partir de telas médias; no celular empilha) |
| `card bg-black border-primary h-100` | Cartão com fundo preto e borda azul; `h-100` iguala a altura dos cartões da linha |
| `card-body p-4` | Área interna do cartão com padding de 1,5 rem |
| `display-6` + `text-primary` (ícone) | Ícone grande na cor do tema |
| `btn btn-outline-primary` / `btn-outline-light btn-sm rounded-circle` | Botão só com borda; no rodapé, versão pequena e redonda dos ícones de rede social |
| `d-flex flex-wrap gap-2` | Linha de itens que quebra para a próxima linha, com espaço de 0,5 rem |
| `d-block link-light link-opacity-75 text-decoration-none` | Link em bloco, cor clara com 75% de opacidade, sem sublinhado |
| `navbar navbar-dark navbar-expand-lg` | Barra de navegação para fundo escuro; vira menu hambúrguer abaixo de telas grandes |
| `border-bottom` / `border-top` + `border-primary` | Linha divisória azul embaixo da navbar e em cima do rodapé |

## O que NÃO foi feito (e por quê)
- Lote 0 (segredos): depende de você no Neon e na Vercel.
- Lotes 3, 5 e 6: não faziam parte do pedido.
- Os testes do projeto (`npm test`, Playwright + banco) **não foram executados** aqui. Rodei só: servidor sobe e responde, redirecionamentos, renderização das 12 variações da página institucional, envio dos 2 formulários (simulado) e verificação de links internos quebrados (0).
- `npm audit` aponta 4 vulnerabilidades (1 crítica, 2 altas) em dependências. Entra no Lote 3.
