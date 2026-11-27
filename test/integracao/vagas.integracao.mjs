// Teste de integração do módulo de vagas contra um PostgreSQL REAL e DESCARTÁVEL.
//
// ATENÇÃO: este teste APAGA todos os dados (TRUNCATE usuarios ... CASCADE).
// Por isso só roda se DATABASE_TEST_URL apontar para localhost ou para um banco com "test" no nome.
//
// Como rodar (exemplo com Postgres local):
//   1. createdb fastwork_test && psql fastwork_test -f src/database/schema.sql
//   2. DATABASE_TEST_URL=postgresql://postgres:senha@127.0.0.1:5432/fastwork_test npm run test:integracao
// Opcional: rode antes src/database/migrations/002_bd2_vagas.sql para testar com os triggers ligados.
import { createServer } from "node:http";

const urlTeste = process.env.DATABASE_TEST_URL;
if (!urlTeste) {
  console.error("Defina DATABASE_TEST_URL (banco descartável). Nada foi executado.");
  process.exit(2);
}
const { hostname, pathname } = new URL(urlTeste);
if (!["localhost", "127.0.0.1"].includes(hostname) && !pathname.toLowerCase().includes("test")) {
  console.error("DATABASE_TEST_URL parece ser um banco real. Recusado para não apagar dados.");
  process.exit(2);
}
process.env.JWT_SECRET ??= "segredo-apenas-para-testes";
process.env.DATABASE_URL = urlTeste;
const root = new URL("../../", import.meta.url).pathname.replace(/\/$/, "");
const { default: app } = await import(`${root}/src/app.js`);
const { default: auth } = await import(`${root}/src/middlewares/authMiddleware.js`);
const { consultar, encerrarPool } = await import(`${root}/src/database/pool.js`);

let falhas = 0, total = 0;
const ok = (cond, nome, extra = "") => { total++; if (!cond) { falhas++; console.log("  FALHOU:", nome, extra); } else console.log("  ok:", nome); };

// ── seed direto no banco (o cadastro usa o driver Neon HTTP, que não roda local) ──
await consultar("TRUNCATE usuarios, categorias RESTART IDENTITY CASCADE");
async function criarUsuario(nome, email, tipo) {
  const [u] = await consultar("INSERT INTO usuarios (nm_usuario, ds_email, ds_senha, ds_telefone, tp_usuario) VALUES ($1,$2,'x','24999990000',$3) RETURNING id_usuario", [nome, email, tipo]);
  return u.id_usuario;
}
async function criarProf(nome, email, profissao, exp) {
  const id = await criarUsuario(nome, email, "profissional");
  const [p] = await consultar("INSERT INTO profissionais (id_usuario, ds_profissao, nr_experiencia, ds_cidade, ds_estado, st_aceite_termos) VALUES ($1,$2,$3,'Volta Redonda','RJ',true) RETURNING id_profissional", [id, profissao, exp]);
  return { id_usuario: id, id_profissional: p.id_profissional, token: auth.gerarToken({ id_usuario: id, ds_email: email, tp_usuario: "profissional" }) };
}
async function criarEmp(nome, email, cnpj) {
  const id = await criarUsuario(nome, email, "empresa");
  const [e] = await consultar("INSERT INTO empresas (id_usuario, ds_cnpj) VALUES ($1,$2) RETURNING id_empresa", [id, cnpj]);
  return { id_usuario: id, id_empresa: e.id_empresa, token: auth.gerarToken({ id_usuario: id, ds_email: email, tp_usuario: "empresa" }) };
}
const empA = await criarEmp("Construtora A", "a@a.com", "11111111000111");
const empB = await criarEmp("Construtora B", "b@b.com", "22222222000122");
const p1 = await criarProf("Pedro Pedreiro", "p1@x.com", "pedreiro", 5);
const p2 = await criarProf("Paulo Pedreiro", "p2@x.com", "pedreiro", 9);
const p3 = await criarProf("Bia Babá", "p3@x.com", "baba", 3);
const p4 = await criarProf("Pat Pedreira", "p4@x.com", "pedreiro", 1);

const server = createServer(app);
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/api`;
const chamar = async (metodo, caminho, token, corpo) => {
  const r = await fetch(base + caminho, { method: metodo, headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: corpo ? JSON.stringify(corpo) : undefined });
  let json = null; try { json = await r.json(); } catch {}
  return { status: r.status, json };
};
const daqui = (h) => new Date(Date.now() + h * 3600e3).toISOString();

console.log("1. Autenticação e perfis");
ok((await chamar("GET", "/vagas")).status === 401, "listar sem token → 401");
ok((await chamar("POST", "/vagas", p1.token, { nm_cargo: "pedreiro" })).status === 403, "profissional não cria vaga → 403");
ok((await chamar("POST", "/vagas/1/candidaturas", empA.token, {})).status === 403, "empresa não se candidata → 403");

console.log("2. Criar vaga (empresa A)");
ok((await chamar("POST", "/vagas", empA.token, { nm_cargo: "pedreiro", dt_encerramento: daqui(-1) })).status === 400, "encerramento no passado → 400");
ok((await chamar("POST", "/vagas", empA.token, { nm_cargo: "pedreiro", dt_publicacao: daqui(5), dt_encerramento: daqui(2) })).status === 400, "encerramento antes da abertura → 400");
ok((await chamar("POST", "/vagas", empA.token, { nm_cargo: "p" })).status === 400, "cargo curto → 400");
const v1 = await chamar("POST", "/vagas", empA.token, { nm_cargo: "Pedreiro", ds_descricao: "Obra residencial", tp_contrato: "freelance", tp_modalidade: "presencial", vl_salario: 3500.5, ds_cidade: "Volta Redonda", ds_estado: "rj", dt_encerramento: daqui(48) });
ok(v1.status === 201 && v1.json.vaga.situacao === "aberta" && v1.json.vaga.nm_cargo === "pedreiro" && v1.json.vaga.ds_estado === "RJ", "criar vaga válida (cargo normalizado, UF maiúscula)", JSON.stringify(v1.json));
const idV1 = v1.json.vaga.id_vaga;
ok(typeof v1.json.vaga.dt_publicacao === "string" && Math.abs(new Date(v1.json.vaga.dt_publicacao) - Date.now()) < 60e3, "abertura padrão = agora (UTC correto)");
ok(Math.abs(new Date(v1.json.vaga.dt_encerramento) - new Date(daqui(48))) < 2000, "data de encerramento volta igual à enviada");
const agendada = await chamar("POST", "/vagas", empA.token, { nm_cargo: "eletricista", dt_publicacao: daqui(24) });
ok(agendada.json.vaga.situacao === "agendada", "vaga com abertura futura fica 'agendada'");

console.log("3. Listagem e compatibilidade");
const l1 = await chamar("GET", "/vagas", p1.token);
ok(l1.status === 200 && l1.json.vagas.length === 1 && l1.json.vagas[0].compativel === true && l1.json.vagas[0].ja_candidatou === false, "pedreiro vê a vaga como compatível");
ok(!l1.json.vagas.some((v) => v.situacao === "agendada"), "vaga agendada não aparece na lista");
const l3 = await chamar("GET", "/vagas", p3.token);
ok(l3.json.vagas[0].compativel === false, "babá vê a mesma vaga como NÃO compatível");
ok((await chamar("GET", "/vagas?compativeis=true", p3.token)).json.total === 0, "filtro 'só compatíveis' esconde para a babá");
ok((await chamar("GET", "/vagas?profissao=pedreiro&cidade=volta", p3.token)).json.total === 1, "filtros profissão + cidade");
ok((await chamar("GET", "/vagas?cidade=%25", p3.token)).json.total === 0, "'%' no filtro não vira curinga");

console.log("4. Candidatura (transação)");
const c3 = await chamar("POST", `/vagas/${idV1}/candidaturas`, p3.token, {});
ok(c3.status === 403 && /pedreiro/i.test(c3.json.erro), "babá NÃO consegue se candidatar → 403", JSON.stringify(c3.json));
const c1 = await chamar("POST", `/vagas/${idV1}/candidaturas`, p1.token, { ds_carta_apresentacao: "Tenho 5 anos de obra" });
ok(c1.status === 201 && c1.json.candidatura.st_candidatura === "pendente", "pedreiro se candidata → 201");
ok((await chamar("POST", `/vagas/${idV1}/candidaturas`, p1.token, {})).status === 409, "candidatura repetida → 409");
ok((await chamar("POST", `/vagas/${agendada.json.vaga.id_vaga}/candidaturas`, p1.token, {})).status === 409, "vaga agendada não aceita candidatura → 409");
ok((await chamar("POST", "/vagas/999999/candidaturas", p1.token, {})).status === 404, "vaga inexistente → 404");
ok((await chamar("POST", "/vagas/abc/candidaturas", p1.token, {})).status === 400, "id inválido → 400");
ok((await chamar("POST", `/vagas/${idV1}/candidaturas`, p1.token, { ds_carta_apresentacao: "x".repeat(2001) })).status === 400, "carta gigante → 400");
ok((await chamar("POST", `/vagas/${idV1}/candidaturas`, p2.token, {})).status === 201, "segundo pedreiro se candidata");
ok((await chamar("POST", `/vagas/${idV1}/candidaturas`, p4.token, {})).status === 201, "terceiro pedreiro se candidata");
const mine = await chamar("GET", "/candidaturas/minhas", p1.token);
ok(mine.json.candidaturas.length === 1 && mine.json.candidaturas[0].nm_empresa === "Construtora A", "minhas candidaturas traz o nome da empresa");
ok((await chamar("GET", "/vagas", p1.token)).json.vagas[0].ja_candidatou === true, "lista marca ja_candidatou");

console.log("5. Permissões entre empresas");
ok((await chamar("GET", `/vagas/${idV1}/candidaturas`, empB.token)).status === 403, "empresa B não vê candidatos da A → 403");
ok((await chamar("PATCH", `/vagas/${idV1}/encerrar`, empB.token)).status === 403, "empresa B não encerra vaga da A → 403");
ok((await chamar("PUT", `/vagas/${idV1}`, empB.token, { ds_descricao: "hack" })).status === 403, "empresa B não edita vaga da A → 403");
ok((await chamar("GET", `/relatorios/vagas/${idV1}/profissionais-compativeis`, empB.token)).status === 403, "empresa B não vê sugestões da vaga da A → 403");
const candidatos = await chamar("GET", `/vagas/${idV1}/candidaturas`, empA.token);
ok(candidatos.status === 200 && candidatos.json.candidatos.length === 3, "empresa A lista 3 candidatos");
ok(candidatos.json.candidatos[0].nm_usuario === "Paulo Pedreiro" && candidatos.json.candidatos[0].posicao === 1 && candidatos.json.candidatos[2].posicao === 3, "ranking por experiência (9 > 5 > 1)");
const idC = Object.fromEntries(candidatos.json.candidatos.map((c) => [c.nm_usuario, c.id_candidatura]));
ok((await chamar("PATCH", `/candidaturas/${idC["Pedro Pedreiro"]}/aprovar`, empB.token)).status === 403, "empresa B não aprova candidato da A → 403");

console.log("6. Edição");
const ed = await chamar("PUT", `/vagas/${idV1}`, empA.token, { ds_descricao: "Obra residencial - atualizada", vl_salario: 4000 });
ok(ed.status === 200 && ed.json.vaga.ds_descricao.includes("atualizada") && ed.json.vaga.vl_salario === 4000 && ed.json.vaga.nm_cargo === "pedreiro", "empresa A edita a vaga (cargo não muda)");
ok((await chamar("PUT", `/vagas/${idV1}`, empA.token, { dt_encerramento: daqui(-5) })).status === 400, "editar encerramento para antes da abertura → 400");

console.log("7. Análise e aprovação (transação)");
ok((await chamar("PATCH", `/candidaturas/${idC["Pedro Pedreiro"]}/analisar`, empA.token)).status === 200, "pendente → em análise");
ok((await chamar("PATCH", `/candidaturas/${idC["Pedro Pedreiro"]}/analisar`, empA.token)).status === 409, "em análise → análise de novo → 409");
const [r1, r2] = await Promise.all([
  chamar("PATCH", `/candidaturas/${idC["Paulo Pedreiro"]}/aprovar`, empA.token),
  chamar("PATCH", `/candidaturas/${idC["Pedro Pedreiro"]}/aprovar`, empA.token),
]);
const sucessos = [r1, r2].filter((r) => r.status === 200).length;
ok(sucessos === 1 && [r1, r2].filter((r) => r.status === 409).length === 1, "duas aprovações simultâneas: exatamente UMA vence", `${r1.status}/${r2.status}`);
const estado = await consultar("SELECT st_candidatura, count(*)::int n FROM candidaturas WHERE id_vaga=$1 GROUP BY 1 ORDER BY 1", [idV1]);
ok(JSON.stringify(estado) === JSON.stringify([{ st_candidatura: "aprovada", n: 1 }, { st_candidatura: "rejeitada", n: 2 }]), "resultado: 1 aprovada + 2 rejeitadas", JSON.stringify(estado));
const [vf] = await consultar("SELECT st_vaga FROM vagas WHERE id_vaga=$1", [idV1]);
ok(vf.st_vaga === "fechada", "vaga fechada automaticamente");
ok((await chamar("POST", `/vagas/${idV1}/candidaturas`, p3.token, {})).status !== 201, "vaga fechada não aceita candidatura");
ok((await chamar("PATCH", `/vagas/${idV1}/encerrar`, empA.token)).status === 409, "encerrar vaga já encerrada → 409");
ok((await chamar("PUT", `/vagas/${idV1}`, empA.token, { ds_descricao: "x" })).status === 409, "vaga encerrada não é editável → 409");

console.log("8. Encerrar vaga + atomicidade (ROLLBACK)");
const v2 = await chamar("POST", "/vagas", empA.token, { nm_cargo: "pedreiro", dt_encerramento: daqui(72) });
const idV2 = v2.json.vaga.id_vaga;
await chamar("POST", `/vagas/${idV2}/candidaturas`, p1.token, {});
await chamar("POST", `/vagas/${idV2}/candidaturas`, p2.token, {});
await consultar("CREATE FUNCTION trg_falha() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'falha simulada'; END $$ LANGUAGE plpgsql");
await consultar("CREATE TRIGGER trg_teste BEFORE UPDATE ON vagas FOR EACH ROW EXECUTE FUNCTION trg_falha()");
const falhou = await chamar("PATCH", `/vagas/${idV2}/encerrar`, empA.token);
ok(falhou.status === 409 || falhou.status === 500, "erro no meio da transação → resposta de erro", String(falhou.status));
const pend = await consultar("SELECT count(*)::int n FROM candidaturas WHERE id_vaga=$1 AND st_candidatura='pendente'", [idV2]);
ok(pend[0].n === 2, "ROLLBACK: candidaturas continuam pendentes", JSON.stringify(pend));
await consultar("DROP TRIGGER trg_teste ON vagas"); await consultar("DROP FUNCTION trg_falha()");
const enc = await chamar("PATCH", `/vagas/${idV2}/encerrar`, empA.token);
ok(enc.status === 200 && enc.json.candidaturas_rejeitadas === 2, "encerrar: fecha e rejeita 2 pendentes", JSON.stringify(enc.json));
const [v2db] = await consultar("SELECT (dt_encerramento AT TIME ZONE 'UTC') AS fim FROM vagas WHERE id_vaga=$1", [idV2]);
ok(Math.abs(new Date(v2db.fim) - Date.now()) < 5000, "prazo futuro foi antecipado para agora");

console.log("9. Relatórios BD2");
const rs = await chamar("GET", "/relatorios/empresa-resumo", empA.token);
ok(rs.status === 200 && rs.json.resumo.total_vagas === 3 && rs.json.resumo.total_candidaturas === 5 && rs.json.resumo.aprovadas === 1 && rs.json.resumo.vagas_sem_candidatos === 1, "resumo da empresa (CTE + subconsultas)", JSON.stringify(rs.json));
const mv = await chamar("GET", "/vagas/minhas", empA.token);
const linha = mv.json.vagas.find((v) => v.id_vaga === idV1);
ok(mv.status === 200 && linha.total_candidaturas === 3 && linha.aprovadas === 1 && linha.rejeitadas === 2 && linha.pendentes === 0, "minhas vagas com contagem por status (GROUP BY + FILTER)", JSON.stringify(linha));
const v3 = await chamar("POST", "/vagas", empA.token, { nm_cargo: "pedreiro" });
await chamar("POST", `/vagas/${v3.json.vaga.id_vaga}/candidaturas`, p1.token, {});
const sug = await chamar("GET", `/relatorios/vagas/${v3.json.vaga.id_vaga}/profissionais-compativeis`, empA.token);
ok(sug.status === 200 && sug.json.profissionais.map((p) => p.nm_usuario).join() === "Paulo Pedreiro,Pat Pedreira" && !("ds_email" in sug.json.profissionais[0]), "sugestões: pedreiros que ainda não se candidataram, sem contato (NOT EXISTS)", JSON.stringify(sug.json));
const dm = await chamar("GET", "/relatorios/demanda-oferta", p1.token);
const ped = dm.json.profissoes.find((p) => p.profissao === "pedreiro");
const bab = dm.json.profissoes.find((p) => p.profissao === "baba");
ok(ped.vagas_abertas === 1 && ped.profissionais_disponiveis === 3 && bab.vagas_abertas === 0 && bab.profissionais_disponiveis === 1, "demanda x oferta (CTE + FULL JOIN)", JSON.stringify(dm.json.profissoes));

console.log("10. Conta desativada");
await consultar("UPDATE usuarios SET st_ativo=false WHERE id_usuario=$1", [p2.id_usuario]);
ok((await chamar("POST", `/vagas/${v3.json.vaga.id_vaga}/candidaturas`, p2.token, {})).status === 403, "token de conta desativada → 403");

server.close(); await encerrarPool();
console.log(`\n${total - falhas}/${total} verificações passaram`);
process.exit(falhas ? 1 : 0);
