import { strict as assert, describe, test } from "poku";
import { chromium } from "playwright";
import jwt from "jsonwebtoken";
import "./helpers/env.js";
import authMiddleware from "../src/middlewares/authMiddleware.js";
import { exigirDono, exigirTipo } from "../src/middlewares/autorizacao.js";
import {
  empresaCadastroSchema,
  loginSchema,
  profissionalCadastroSchema,
  usuarioCadastroSchema,
} from "../src/schemas/validacaoSchemas.js";
import {
  isDuplicateEmailError,
  isUniqueViolation,
} from "../src/utils/errosBanco.js";
import { closeApp, jsonOptions, request, startApp } from "./helpers/app.js";

async function executarMiddleware(middleware, usuarioLogado) {
  let statusCode;
  let payload;
  let chamouNext = false;
  const req = { usuarioLogado, params: { id: "10" } };
  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(value) {
      payload = value;
      return res;
    },
  };

  await middleware(req, res, () => {
    chamouNext = true;
  });

  return { statusCode, payload, chamouNext };
}

// 1. Testes de importação e inicialização do app.
describe("1. Importação e inicialização do app", () => {
  test("importa o Express e inicia um servidor HTTP", async () => {
    // Testa que o app pode ser importado sem iniciar o servidor duas vezes.
    const running = await startApp();
    const response = await fetch(`${running.url}/`);
    await closeApp(running.server);

    assert.equal(response.status, 200);
    assert.match(await response.text(), /<!doctype html>/i);
  });
});

// 2. Testes do middleware JWT.
describe("2. Middleware JWT", () => {
  test("gera e valida um token Bearer", () => {
    // Testa a criação do JWT e o preenchimento de req.usuarioLogado.
    const token = authMiddleware.gerarToken({
      id_usuario: 7,
      tp_usuario: "profissional",
    });
    const req = { headers: { authorization: `Bearer ${token}` } };
    let chamouNext = false;
    const res = { status: () => res, json: () => res };

    authMiddleware.validarToken(req, res, () => {
      chamouNext = true;
    });

    assert.equal(chamouNext, true);
    assert.equal(req.usuarioLogado.id_usuario, 7);
  });

  test("rejeita token ausente ou inválido", () => {
    // Testa as respostas 401 para ausência e falsificação de credencial.
    for (const authorization of [undefined, "Bearer token-invalido"]) {
      let statusCode;
      let payload;
      const req = { headers: { authorization } };
      const res = {
        status(code) {
          statusCode = code;
          return res;
        },
        json(value) {
          payload = value;
          return res;
        },
      };

      authMiddleware.validarToken(req, res, () =>
        assert.fail("next não deveria ser chamado"),
      );
      assert.equal(statusCode, 401);
      assert.equal(payload.ok, false);
    }

    const tokenComAlgoritmoNaoPermitido = jwt.sign(
      { id_usuario: 7 },
      process.env.JWT_SECRET,
      { algorithm: "HS384" },
    );
    let statusCode;
    const res = {
      status(code) {
        statusCode = code;
        return res;
      },
      json() {
        return res;
      },
    };
    authMiddleware.validarToken(
      { headers: { authorization: `Bearer ${tokenComAlgoritmoNaoPermitido}` } },
      res,
      () => assert.fail("JWT HS384 não deveria ser aceito"),
    );
    assert.equal(statusCode, 401);
  });
});

// 3. Testes de autorização.
describe("3. Middleware de autorização", () => {
  test("permite somente o proprietário do perfil", async () => {
    const permitido = await executarMiddleware(
      exigirDono(async () => 7),
      { id_usuario: 7 },
    );
    const negado = await executarMiddleware(
      exigirDono(async () => 8),
      { id_usuario: 7 },
    );

    assert.equal(permitido.chamouNext, true);
    assert.equal(negado.statusCode, 403);
    assert.equal(negado.payload.ok, false);
  });

  test("deixa recurso inexistente para o controller responder", async () => {
    const resultado = await executarMiddleware(
      exigirDono(async () => null),
      { id_usuario: 7 },
    );

    assert.equal(resultado.chamouNext, true);
  });

  test("exige o tipo de conta correto", async () => {
    const permitido = await executarMiddleware(
      exigirTipo("profissional"),
      { id_usuario: 7, tp_usuario: "profissional" },
    );
    const negado = await executarMiddleware(
      exigirTipo("profissional"),
      { id_usuario: 8, tp_usuario: "empresa" },
    );

    assert.equal(permitido.chamouNext, true);
    assert.equal(negado.statusCode, 403);
    assert.equal(negado.payload.ok, false);
  });
});

// 4. Testes de login.
describe("4. Login", () => {
  test("exige email e senha no login profissional e empresarial", async () => {
    // Testa a validação de entrada dos dois endpoints públicos de login.
    for (const path of ["/api/login", "/api/login/empresa"]) {
      const response = await request(path, jsonOptions("POST", {}));
      const body = await response.json();
      assert.equal(response.status, 400);
      assert.equal(body.ok, false);
      assert.equal(body.erro, "Dados inválidos");
    }
  });

  test("valida formato de e-mail e tamanho da senha", () => {
    assert.equal(
      loginSchema.safeParse({ ds_email: "valido@example.com", ds_senha: "Senha123" }).success,
      true,
    );
    assert.equal(
      loginSchema.safeParse({ ds_email: "invalido", ds_senha: "Senha123" }).success,
      false,
    );
    assert.equal(
      loginSchema.safeParse({ ds_email: "valido@example.com", ds_senha: "curta" }).success,
      false,
    );
    assert.equal(
      loginSchema.safeParse({
        ds_email: "valido@example.com",
        ds_senha: "á".repeat(37),
      }).success,
      false,
    );
  });
});

// 5. Testes de cadastro profissional e empresa.
const temBancoDeTeste = Boolean(process.env.DATABASE_TEST_URL);

describe("5. Cadastro profissional e empresa", () => {
  test("valida campos obrigatórios de profissional e empresa", async () => {
    // Testa que cadastros incompletos são recusados antes de acessar o banco.
    for (const path of ["/api/usuarios", "/api/empresas"]) {
      const response = await request(path, jsonOptions("POST", {}));
      assert.equal(response.status, 400);
      const body = await response.json();
      assert.equal(body.erro, "Dados inválidos");
    }
  });

  test("responde erro genérico para campos de cadastro inválidos", async () => {
    const response = await request(
      "/api/usuarios",
      jsonOptions("POST", {
        nm_usuario: "Nome",
        ds_email: "email-invalido",
        ds_senha: "Senha123",
        ds_telefone: "123",
      }),
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(body, { ok: false, erro: "Dados inválidos" });
  });

  test("valida limites de cadastro e formatos de contato", () => {
    const cadastroProfissional = {
      nm_usuario: "Nome",
      ds_email: "PROFISSIONAL@example.com",
      ds_senha: "Senha123",
      ds_telefone: "(24) 99999-9999",
      ds_estado: "rj",
      ds_cep: "27200-000",
      ds_linkedin: "https://linkedin.com/in/perfil",
    };
    const profissionalValidado = usuarioCadastroSchema.safeParse(cadastroProfissional);
    assert.equal(profissionalValidado.success, true);
    assert.equal(profissionalValidado.data.ds_email, "profissional@example.com");
    assert.equal(profissionalValidado.data.ds_estado, "RJ");
    assert.equal(profissionalCadastroSchema.safeParse(cadastroProfissional).success, true);

    assert.equal(
      usuarioCadastroSchema.safeParse({
        ...cadastroProfissional,
        ds_telefone: "123",
      }).success,
      false,
    );
    assert.equal(
      usuarioCadastroSchema.safeParse({
        ...cadastroProfissional,
        ds_cep: "abc",
      }).success,
      false,
    );
    assert.equal(
      usuarioCadastroSchema.safeParse({
        ...cadastroProfissional,
        ds_linkedin: "não é url",
      }).success,
      false,
    );
    assert.equal(
      usuarioCadastroSchema.safeParse({
        ...cadastroProfissional,
        nm_usuario: "x".repeat(151),
      }).success,
      false,
    );
    assert.equal(
      empresaCadastroSchema.safeParse({
        nm_usuario: "Empresa",
        ds_email: "empresa@example.com",
        ds_senha: "Senha123",
        ds_telefone: "24999999999",
        ds_cnpj: "11.222.333/0001-81",
        ds_site: "https://empresa.example",
      }).success,
      true,
    );
  });

  test("identifica somente conflitos únicos de e-mail como 23505", () => {
    assert.equal(
      isDuplicateEmailError({ code: "23505", constraint: "usuarios_ds_email_key" }),
      true,
    );
    assert.equal(
      isDuplicateEmailError({ code: "23505", constraint: "empresas_ds_cnpj_key" }),
      false,
    );
    assert.equal(isDuplicateEmailError({ code: "23505" }), true);
    assert.equal(isDuplicateEmailError({ code: "23503" }), false);
    assert.equal(isUniqueViolation({ code: "23505" }), true);
    assert.equal(isUniqueViolation({ code: "23503" }), false);
  });

  if (temBancoDeTeste) {
    test("cadastra um profissional e uma empresa no banco de teste", async () => {
      // Testa o fluxo completo de persistência das duas modalidades de cadastro.
      const suffix = Date.now();
      const profissional = await request(
        "/api/usuarios",
        jsonOptions("POST", {
          nm_usuario: "Profissional de Teste",
          ds_email: `prof-${suffix}@teste.local`,
          ds_senha: "Senha123!",
          ds_telefone: "24999999999",
          ds_profissao: "Eletricista",
        }),
      );
      const empresa = await request(
        "/api/empresas",
        jsonOptions("POST", {
          nm_usuario: "Empresa de Teste",
          ds_email: `empresa-${suffix}@teste.local`,
          ds_senha: "Senha123!",
          ds_telefone: "24988888888",
          ds_cnpj: "11.222.333/0001-81",
        }),
      );

      assert.equal(profissional.status, 201);
      assert.equal(empresa.status, 201);
    });
  } else {
    test.skip("cadastro completo requer DATABASE_TEST_URL", () => {});
  }
});

// 6. Testes das rotas protegidas.
describe("6. Rotas protegidas", () => {
  test("recusa acesso sem JWT", async () => {
    // Testa que usuários não autenticados não alcançam as rotas protegidas.
    for (const path of [
      "/api/usuarios",
      "/api/usuarios/1",
      "/api/empresas",
      "/api/profissionais",
    ]) {
      const response = await request(path);
      assert.equal(response.status, 401, path);
    }
  });
});

// 7. Testes dos repositórios usando banco separado.
describe("7. Repositórios com banco separado", () => {
  if (temBancoDeTeste) {
    test("consulta usuários, profissionais e empresas", async () => {
      // Testa os contratos básicos sem usar o banco de desenvolvimento.
      process.env.DATABASE_URL = process.env.DATABASE_TEST_URL;
      const { default: usuarioRepository } =
        await import("../src/repositories/usuarioRepository.js");
      const { default: profissionalRepository } =
        await import("../src/repositories/profissionalRepository.js");
      const { default: empresaRepository } =
        await import("../src/repositories/empresaRepository.js");

      assert.equal(
        await usuarioRepository.emailExiste("nao-existe@teste.local"),
        false,
      );
      assert.deepEqual(
        await profissionalRepository.readPaginated({
          profissao: null,
          cidade: null,
          disponivel: null,
          limit: 10,
          offset: 0,
        }),
        { profissionais: [], total: 0 },
      );
      assert.deepEqual(await empresaRepository.readAll(), []);
    });
  } else {
    test.skip("repositórios requerem um banco exclusivo em DATABASE_TEST_URL", () => {});
  }
});

// 8. Testes das páginas HTTP.
describe("8. Páginas HTTP", () => {
  test("entrega as principais páginas HTML", async () => {
    // Testa status HTTP, conteúdo HTML e o redirecionamento de login.html.
    for (const path of [
      "/",
      "/index.html",
      "/login",
      "/formu.html",
      "/src/views/formu.html",
      "/cadastroem.html",
      "/src/views/cadastroem.html",
      "/sobre.html",
      "/src/views/login.html",
      "/src/views/sobre.html",
      "/src/views/Dev.html",
      "/src/views/institucional.html",
      "/src/views/contrato_new.html",
      "/src/public/js/APIs.js",
      "/src/public/css/paginas.css",
      "/public/js/login.js",
    ]) {
      const response = await request(path);
      assert.equal(response.status, 200, path);
      if (path.endsWith(".html") || path === "/" || path === "/login") {
        assert.match(response.headers.get("content-type"), /text\/html/);
      }
    }

    const redirect = await request("/login.html", { redirect: "manual" });
    assert.equal(redirect.status, 302);
    assert.equal(redirect.headers.get("location"), "/login");

    for (const path of [
      "/package.json",
      "/src/database/schema.sql",
      "/test/",
      "/src/services/APIs.js",
    ]) {
      const response = await request(path);
      assert.equal(response.status, 404, path);
    }
  });

  test("aplica cabeçalhos Helmet e limita o corpo JSON", async () => {
    const running = await startApp();
    try {
      const pageResponse = await fetch(`${running.url}/login`, {
        headers: { origin: "http://localhost:3000" },
      });
      const csp = pageResponse.headers.get("content-security-policy");
      assert.match(csp, /script-src 'self'/);
      assert.match(csp, /connect-src 'self' https:\/\/viacep\.com\.br/);
      assert.match(csp, /img-src 'self' data: https:\/\/tse3\.mm\.bing\.net/);
      assert.equal(pageResponse.headers.get("x-content-type-options"), "nosniff");
      assert.equal(
        pageResponse.headers.get("access-control-allow-origin"),
        "http://localhost:3000",
      );

      const deniedOriginResponse = await fetch(`${running.url}/login`, {
        headers: { origin: "https://origem-nao-permitida.example" },
      });
      assert.notEqual(
        deniedOriginResponse.headers.get("access-control-allow-origin"),
        "https://origem-nao-permitida.example",
      );

      const bodyResponse = await fetch(`${running.url}/api/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ valor: "x".repeat(11 * 1024) }),
      });
      assert.equal(bodyResponse.status, 413);
    } finally {
      await closeApp(running.server);
    }
  });
});

// 9. Proteções HTTP e testes de navegador com Playwright.
describe("9. Proteções HTTP e navegador", () => {
  test("limita tentativas de login e responde 429 em JSON", async () => {
    const running = await startApp();
    try {
      let response;
      for (let tentativa = 0; tentativa < 11; tentativa += 1) {
        response = await fetch(`${running.url}/api/login`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({}),
        });
      }

      assert.equal(response.status, 429);
      assert.match(response.headers.get("content-type"), /application\/json/);
      const body = await response.json();
      assert.equal(body.ok, false);
      assert.match(body.erro, /Muitas tentativas/);
    } finally {
      await closeApp(running.server);
    }
  });

  test("abre a página inicial e encontra o documento renderizado", async () => {
    // Testa a aplicação no navegador real, incluindo navegação e título da página.
    const running = await startApp();
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      const response = await page.goto(running.url, {
        waitUntil: "domcontentloaded",
      });
      assert.equal(response.status(), 200);
      assert.match(await page.title(), /FastWork/i);
      assert.equal(await page.locator("body").isVisible(), true);
    } finally {
      await browser.close();
      await closeApp(running.server);
    }
  });
});
