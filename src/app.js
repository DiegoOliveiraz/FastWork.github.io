import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import empresaRoutes from "./routes/empresaRoutes.js";
import profissionalRoutes from "./routes/profissionalRoutes.js";
import vagaRoutes from "./routes/vagaRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const servePublic = express.static(publicDir);

const app = express();

app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "connect-src": ["'self'", "https://viacep.com.br"],
      "img-src": ["'self'", "data:", "https://tse3.mm.bing.net"],
    },
  },
}));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || false }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/src/public", servePublic);
app.use("/public", servePublic);

app.use("/api", usuarioRoutes);
app.use("/api", empresaRoutes);
app.use("/api", profissionalRoutes);
app.use("/api", vagaRoutes);

// Rotas HTML explicitamente permitidas; arquivos do projeto não são servidos estaticamente.
const sendView = (filename) => (_req, res) =>
  res.sendFile(path.join(__dirname, "views", filename));
const sendIndex = (_req, res) =>
  res.sendFile(path.join(__dirname, "..", "index.html"));

app.get(["/", "/index.html"], sendIndex);
app.get(["/formu.html", "/src/views/formu.html"], sendView("formu.html"));
app.get(["/cadastroem.html", "/src/views/cadastroem.html"], sendView("cadastroem.html"));
app.get(["/login", "/src/views/login.html"], sendView("login.html"));
app.get(["/sobre.html", "/src/views/sobre.html"], sendView("sobre.html"));
app.get(["/Dev.html", "/src/views/Dev.html"], sendView("Dev.html"));
app.get(
  ["/institucional.html", "/src/views/institucional.html"],
  sendView("institucional.html"),
);
app.get(
  ["/contrato_new.html", "/src/views/contrato_new.html"],
  sendView("contrato_new.html"),
);
app.get(["/vagas.html", "/src/views/vagas.html"], sendView("vagas.html"));
app.get(
  ["/admin-vagas.html", "/src/views/admin-vagas.html"],
  sendView("admin-vagas.html"),
);
app.get("/login.html", (req, res) => res.redirect("/login"));

// URLs antigas das páginas institucionais (agora todas em institucional.html).
// Mantém links externos e favoritos funcionando.
const paginasInstitucionais = [
  "acessibilidade", "em-breve", "investidores", "politicas", "seguranca",
  "publicidade", "fornecedores", "legal", "cookies", "empregos", "ajuda",
];
for (const pagina of paginasInstitucionais) {
  const destino = `/src/views/institucional.html?pagina=${pagina}`;
  app.get([`/${pagina}.html`, `/src/views/${pagina}.html`], (req, res) =>
    res.redirect(301, destino),
  );
}
// Dashboard e validação foram removidos (eram da fase localStorage).
app.get(["/dashboard.html", "/validacao.html"], (req, res) => res.redirect(301, "/"));
// Páginas duplicadas removidas: apontam para as versões que ficaram.
app.get(["/PaginaSobre.html", "/src/views/PaginaSobre.html"], (req, res) => res.redirect(301, "/sobre.html"));
app.get(["/desenvolvedores.html", "/src/views/desenvolvedores.html"], (req, res) => res.redirect(301, "/Dev.html"));

app.use((req, res) => res.status(404).send("Página não encontrada"));

export default app;
