import { strict as assert, describe, test } from "poku";
import { chromium } from "playwright";
import "./helpers/env.js";
import authMiddleware from "../src/middlewares/authMiddleware.js";
import { closeApp, jsonOptions, request, startApp } from "./helpers/app.js";

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
  });
});

// 3. Testes de login.
describe("3. Login", () => {
  test("exige email e senha no login profissional e empresarial", async () => {
    // Testa a validação de entrada dos dois endpoints públicos de login.
    for (const path of ["/api/login", "/api/login/empresa"]) {
      const response = await request(path, jsonOptions("POST", {}));
      const body = await response.json();
      assert.equal(response.status, 400);
      assert.equal(body.ok, false);
    }
  });
});

// 4. Testes de cadastro profissional e empresa.
const temBancoDeTeste = Boolean(process.env.DATABASE_TEST_URL);

describe("4. Cadastro profissional e empresa", () => {
  test("valida campos obrigatórios de profissional e empresa", async () => {
    // Testa que cadastros incompletos são recusados antes de acessar o banco.
    for (const path of ["/api/usuarios", "/api/empresas"]) {
      const response = await request(path, jsonOptions("POST", {}));
      assert.equal(response.status, 400);
    }
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

// 5. Testes das rotas protegidas.
describe("5. Rotas protegidas", () => {
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

// 6. Testes dos repositórios usando banco separado.
describe("6. Repositórios com banco separado", () => {
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

// 7. Testes das páginas HTTP.
describe("7. Páginas HTTP", () => {
  test("entrega as principais páginas HTML", async () => {
    // Testa status HTTP, conteúdo HTML e o redirecionamento de login.html.
    for (const path of [
      "/",
      "/login",
      "/formu.html",
      "/cadastroem.html",
      "/sobre.html",
    ]) {
      const response = await request(path);
      assert.equal(response.status, 200, path);
      assert.match(response.headers.get("content-type"), /text\/html/);
    }

    const redirect = await request("/login.html", { redirect: "manual" });
    assert.equal(redirect.status, 302);
    assert.equal(redirect.headers.get("location"), "/login");
  });
});

// 8. Testes de navegador com Playwright.
describe("8. Navegador com Playwright", () => {
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
