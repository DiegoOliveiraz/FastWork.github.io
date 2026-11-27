import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { exigirTipo } from "../middlewares/autorizacao.js";
import { carregarEmpresa, carregarProfissional } from "../middlewares/contextoUsuario.js";
import limiteEscrita from "../middlewares/limiteEscrita.js";
import validarBody from "../middlewares/validarBody.js";
import {
  candidaturaSchema,
  vagaAtualizacaoSchema,
  vagaCriacaoSchema,
} from "../schemas/vagaSchemas.js";
import {
  atualizarVaga,
  criarVaga,
  encerrarVaga,
  listarVagas,
  minhasVagas,
} from "../controllers/vagaController.js";
import {
  analisarCandidatura,
  aprovarCandidatura,
  candidatar,
  listarCandidatos,
  minhasCandidaturas,
} from "../controllers/candidaturaController.js";
import {
  demandaOferta,
  profissionaisCompativeis,
  resumoDaEmpresa,
} from "../controllers/relatorioController.js";

const vagaRoutes = Router();

const logado = authMiddleware.validarToken;
// Painel de vagas: só contas do tipo "empresa" (o "administrador" das vagas dela).
const soEmpresa = [logado, exigirTipo("empresa"), carregarEmpresa];
const soProfissional = [logado, exigirTipo("profissional"), carregarProfissional];

// ── Vagas ──────────────────────────────────────────────────────────────────────
vagaRoutes.get("/vagas", logado, listarVagas);
vagaRoutes.get("/vagas/minhas", ...soEmpresa, minhasVagas);
vagaRoutes.post("/vagas", ...soEmpresa, limiteEscrita, validarBody(vagaCriacaoSchema), criarVaga);
vagaRoutes.put("/vagas/:id", ...soEmpresa, limiteEscrita, validarBody(vagaAtualizacaoSchema), atualizarVaga);
vagaRoutes.patch("/vagas/:id/encerrar", ...soEmpresa, limiteEscrita, encerrarVaga);

// ── Candidaturas ───────────────────────────────────────────────────────────────
vagaRoutes.post(
  "/vagas/:id/candidaturas",
  ...soProfissional, limiteEscrita, validarBody(candidaturaSchema), candidatar,
);
vagaRoutes.get("/vagas/:id/candidaturas", ...soEmpresa, listarCandidatos);
vagaRoutes.get("/candidaturas/minhas", ...soProfissional, minhasCandidaturas);
vagaRoutes.patch("/candidaturas/:id/analisar", ...soEmpresa, limiteEscrita, analisarCandidatura);
vagaRoutes.patch("/candidaturas/:id/aprovar", ...soEmpresa, limiteEscrita, aprovarCandidatura);

// ── Relatórios (BD2) ───────────────────────────────────────────────────────────
vagaRoutes.get("/relatorios/empresa-resumo", ...soEmpresa, resumoDaEmpresa);
vagaRoutes.get("/relatorios/vagas/:id/profissionais-compativeis", ...soEmpresa, profissionaisCompativeis);
vagaRoutes.get("/relatorios/demanda-oferta", logado, demandaOferta);

export default vagaRoutes;
