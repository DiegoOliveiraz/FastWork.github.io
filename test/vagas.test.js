import { strict as assert, describe, test } from "poku";
import "./helpers/env.js";
import authMiddleware from "../src/middlewares/authMiddleware.js";
import { jsonOptions, request } from "./helpers/app.js";
import { lerId } from "../src/utils/erroNegocio.js";
import { normalizarTexto, profissaoCompativel } from "../src/utils/profissoes.js";
import {
  candidaturaSchema,
  vagaAtualizacaoSchema,
  vagaCriacaoSchema,
} from "../src/schemas/vagaSchemas.js";

// Estes testes não usam banco: cobrem regras puras, validação e permissões que são
// barradas ANTES de qualquer consulta. O fluxo completo com banco fica em
// test/integracao/vagas.integracao.mjs (npm run test:integracao).

const tokenEmpresa = authMiddleware.gerarToken({ id_usuario: 1, ds_email: "e@e.com", tp_usuario: "empresa" });
const tokenProfissional = authMiddleware.gerarToken({ id_usuario: 2, ds_email: "p@p.com", tp_usuario: "profissional" });
const daqui = (horas) => new Date(Date.now() + horas * 3600e3).toISOString();

describe("Vagas: regra de profissão", () => {
  test("compara sem acento, caixa ou espaços", () => {
    assert.equal(normalizarTexto("  BABÁ "), "baba");
    assert.equal(profissaoCompativel("Pedreiro", "pedreiro"), true);
    assert.equal(profissaoCompativel(" pedreiro ", "PEDREIRO"), true);
  });

  test("babá não é compatível com vaga de pedreiro", () => {
    assert.equal(profissaoCompativel("baba", "pedreiro"), false);
    assert.equal(profissaoCompativel("pedreiro", "eletricista"), false);
  });

  test("perfil sem profissão nunca é compatível", () => {
    assert.equal(profissaoCompativel(null, "pedreiro"), false);
    assert.equal(profissaoCompativel("", ""), false);
    assert.equal(profissaoCompativel(undefined, "pedreiro"), false);
  });
});

describe("Vagas: validação de entrada", () => {
  test("aceita uma vaga mínima e uma completa", () => {
    assert.equal(vagaCriacaoSchema.safeParse({ nm_cargo: "pedreiro" }).success, true);
    const completa = vagaCriacaoSchema.safeParse({
      nm_cargo: "eletricista", ds_descricao: "Obra", tp_contrato: "freelance", tp_modalidade: "presencial",
      vl_salario: 3500.5, ds_cidade: "Volta Redonda", ds_estado: "rj",
      dt_publicacao: daqui(1), dt_encerramento: daqui(48),
    });
    assert.equal(completa.success, true);
    assert.equal(completa.data.ds_estado, "RJ");
  });

  test("recusa cargo curto, contrato inválido, salário negativo e UF errada", () => {
    for (const corpo of [
      { nm_cargo: "p" },
      { nm_cargo: "pedreiro", tp_contrato: "outro" },
      { nm_cargo: "pedreiro", vl_salario: -1 },
      { nm_cargo: "pedreiro", ds_estado: "RJX" },
      { nm_cargo: "pedreiro", dt_encerramento: "amanhã" },
    ]) {
      assert.equal(vagaCriacaoSchema.safeParse(corpo).success, false, JSON.stringify(corpo));
    }
  });

  test("encerramento precisa ser depois da abertura", () => {
    const invertido = { dt_publicacao: daqui(10), dt_encerramento: daqui(2) };
    assert.equal(vagaCriacaoSchema.safeParse({ nm_cargo: "pedreiro", ...invertido }).success, false);
    assert.equal(vagaAtualizacaoSchema.safeParse(invertido).success, false);
  });

  test("tipo da vaga não pode ser alterado na edição", () => {
    const resultado = vagaAtualizacaoSchema.safeParse({ nm_cargo: "pintor", ds_descricao: "x" });
    assert.equal(resultado.success, true);
    assert.equal("nm_cargo" in resultado.data, false);
  });

  test("carta de apresentação tem limite de 2000 caracteres", () => {
    assert.equal(candidaturaSchema.safeParse({}).success, true);
    assert.equal(candidaturaSchema.safeParse({ ds_carta_apresentacao: "x".repeat(2000) }).success, true);
    assert.equal(candidaturaSchema.safeParse({ ds_carta_apresentacao: "x".repeat(2001) }).success, false);
  });

  test("lerId só aceita inteiro positivo dentro do limite do Postgres", () => {
    assert.equal(lerId("12"), 12);
    for (const invalido of ["0", "-1", "abc", "1.5", "2147483648", "", undefined]) {
      assert.equal(lerId(invalido), null, String(invalido));
    }
  });
});

describe("Vagas: permissões (barradas antes do banco)", () => {
  test("rotas de vagas exigem token", async () => {
    for (const [metodo, caminho] of [
      ["GET", "/api/vagas"],
      ["GET", "/api/vagas/minhas"],
      ["POST", "/api/vagas"],
      ["POST", "/api/vagas/1/candidaturas"],
      ["PATCH", "/api/vagas/1/encerrar"],
      ["PATCH", "/api/candidaturas/1/aprovar"],
      ["GET", "/api/relatorios/demanda-oferta"],
    ]) {
      const resposta = await request(caminho, { method: metodo });
      assert.equal(resposta.status, 401, `${metodo} ${caminho}`);
    }
  });

  test("profissional não cria, fecha nem aprova", async () => {
    const corpo = { nm_cargo: "pedreiro" };
    assert.equal((await request("/api/vagas", jsonOptions("POST", corpo, tokenProfissional))).status, 403);
    assert.equal((await request("/api/vagas/1/encerrar", jsonOptions("PATCH", {}, tokenProfissional))).status, 403);
    assert.equal((await request("/api/candidaturas/1/aprovar", jsonOptions("PATCH", {}, tokenProfissional))).status, 403);
    assert.equal((await request("/api/vagas/minhas", jsonOptions("GET", undefined, tokenProfissional))).status, 403);
  });

  test("empresa não se candidata", async () => {
    const resposta = await request("/api/vagas/1/candidaturas", jsonOptions("POST", {}, tokenEmpresa));
    assert.equal(resposta.status, 403);
  });
});

describe("Vagas: páginas", () => {
  test("entrega as páginas e scripts novos", async () => {
    for (const caminho of [
      "/vagas.html", "/src/views/vagas.html", "/admin-vagas.html", "/src/views/admin-vagas.html",
      "/src/public/js/vagas.js", "/src/public/js/admin-vagas.js", "/src/public/js/vagas-comum.js",
    ]) {
      const resposta = await request(caminho);
      assert.equal(resposta.status, 200, caminho);
    }
  });

  test("não expõe a migração SQL", async () => {
    const resposta = await request("/src/database/migrations/002_bd2_vagas.sql");
    assert.equal(resposta.status, 404);
  });
});
