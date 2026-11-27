# Como contribuir com o FastWork

## Fluxo de trabalho (Kanban no GitHub Projects)

`Backlog → Ready → In Progress → Review → Done`

1. Pegue um card em **Ready** e mova para **In Progress**.
2. Crie a branch a partir de `main` com o prefixo certo:
   - `feature/<nome-curto>` para funcionalidade nova
   - `fix/<nome-curto>` para correção de bug
   - `chore/<nome-curto>` para manutenção (dependências, limpeza, configuração)
3. Faça commits pequenos, com mensagem no imperativo: `Adiciona rota de vagas`.
4. Abra um **Pull Request** para `main` usando o modelo (`.github/pull_request_template.md`) e ligue à issue com `Fecha #N`. O card vai para **Review**.
5. Com o CI verde, o Quality Gate do SonarQube aprovado e a revisão feita, faça o merge. O card vai para **Done**.

Nada vai direto para `main`. Ative em Settings → Branches a regra de proteção: PR obrigatório e checks verdes.

## Segredos

Nunca versione `.env`. Copie `.env.example` para `.env` e preencha localmente. Em produção, use as variáveis de ambiente da Vercel. Se um segredo vazar, troque-o imediatamente: apagar o commit não basta.

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha JWT_SECRET e DATABASE_URL
npm run dev
npm test
```
