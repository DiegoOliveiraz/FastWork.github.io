// Funções usadas pelas páginas de vagas (vagas.html e admin-vagas.html).
// Tudo fica dentro de window.FW para não poluir o escopo global.
// Sem innerHTML: todo texto entra via textContent (dados de usuários nunca viram HTML).
const FW = (() => {
  const CHAVE_SESSAO = "fastwork_session";

  // Mantenha igual às opções de formu.html e a src/utils/profissoes.js.
  const PROFISSOES = {
    pedreiro: "Pedreiro",
    eletricista: "Eletricista",
    encanador: "Encanador",
    pintor: "Pintor",
    carpinteiro: "Carpinteiro",
    outro: "Outro",
  };

  const SITUACOES_VAGA = {
    aberta: ["bg-success", "Aberta"],
    agendada: ["bg-info text-dark", "Agendada"],
    expirada: ["bg-secondary", "Prazo encerrado"],
    fechada: ["bg-danger", "Fechada"],
    pausada: ["bg-warning text-dark", "Pausada"],
  };

  const STATUS_CANDIDATURA = {
    pendente: ["bg-secondary", "Pendente"],
    em_analise: ["bg-info text-dark", "Em análise"],
    aprovada: ["bg-success", "Aprovada"],
    rejeitada: ["bg-danger", "Rejeitada"],
  };

  function lerSessao() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_SESSAO) || "null");
    } catch {
      return null;
    }
  }

  // Chama a API enviando o token da sessão. Devolve { ok, status, dados }.
  async function api(caminho, { metodo = "GET", corpo } = {}) {
    const sessao = lerSessao();
    const cabecalhos = { "Content-Type": "application/json" };
    if (sessao?.token) cabecalhos.Authorization = `Bearer ${sessao.token}`;

    try {
      const resposta = await fetch(`/api${caminho}`, {
        method: metodo,
        headers: cabecalhos,
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
      });
      let dados = {};
      try {
        dados = await resposta.json();
      } catch {
        // resposta sem JSON (ex.: 429 de um proxy): segue com objeto vazio
      }
      if (resposta.status === 401) localStorage.removeItem(CHAVE_SESSAO); // token expirado
      return { ok: resposta.ok && dados.ok !== false, status: resposta.status, dados };
    } catch {
      return { ok: false, status: 0, dados: { erro: "Não foi possível conectar ao servidor. Tente novamente." } };
    }
  }

  function el(tag, classe, texto) {
    const no = document.createElement(tag);
    if (classe) no.className = classe;
    if (texto !== undefined && texto !== null && texto !== "") no.textContent = texto;
    return no;
  }

  function icone(nome, classe = "") {
    const i = el("i", `bi ${nome} ${classe}`.trim());
    i.setAttribute("aria-hidden", "true");
    return i;
  }

  function badge([classe, texto], extra = "") {
    return el("span", `badge ${classe} ${extra}`.trim(), texto);
  }

  function rotuloProfissao(valor) {
    if (!valor) return "Não informada";
    const chave = String(valor).trim().toLowerCase();
    return PROFISSOES[chave] ?? chave.charAt(0).toUpperCase() + chave.slice(1);
  }

  function formatarData(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  }

  function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return "A combinar";
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  // Texto do prazo da vaga, conforme a situação atual.
  function descreverPrazo(vaga) {
    const partes = [];
    if (vaga.situacao === "agendada") partes.push(`Abre em ${formatarData(vaga.dt_publicacao)}`);
    else if (vaga.dt_publicacao) partes.push(`Aberta desde ${formatarData(vaga.dt_publicacao)}`);
    if (vaga.dt_encerramento) {
      const passado = new Date(vaga.dt_encerramento) <= new Date();
      partes.push(`${passado ? "Encerrou" : "Encerra"} em ${formatarData(vaga.dt_encerramento)}`);
    } else {
      partes.push("Sem data para encerrar");
    }
    return partes.join(" · ");
  }

  // Valor de <input type="datetime-local"> (horário do navegador) → ISO em UTC para a API.
  function paraISO(valorDatetimeLocal) {
    if (!valorDatetimeLocal) return undefined;
    const data = new Date(valorDatetimeLocal);
    return Number.isNaN(data.getTime()) ? undefined : data.toISOString();
  }

  // Alerta Bootstrap dentro de um container (substitui o anterior).
  function mostrarAlerta(container, tipo, mensagem) {
    const alerta = el("div", `alert alert-${tipo} alert-dismissible fade show`, mensagem);
    alerta.setAttribute("role", "alert");
    const fechar = el("button", "btn-close");
    fechar.type = "button";
    fechar.setAttribute("data-bs-dismiss", "alert");
    fechar.setAttribute("aria-label", "Fechar");
    alerta.appendChild(fechar);
    container.replaceChildren(alerta);
  }

  // Cartão avisando que é preciso entrar / ter outro tipo de conta.
  function cartaoAviso(titulo, texto, textoBotao, href) {
    const cartao = el("div", "card bg-black border-primary text-center");
    const corpo = el("div", "card-body p-5");
    corpo.appendChild(icone("bi-lock-fill", "display-5 text-primary"));
    corpo.appendChild(el("h2", "h4 mt-3", titulo));
    corpo.appendChild(el("p", "text-white-50 mb-4", texto));
    const botao = el("a", "btn btn-primary", textoBotao);
    botao.href = href;
    corpo.appendChild(botao);
    cartao.appendChild(corpo);
    return cartao;
  }

  return {
    PROFISSOES, SITUACOES_VAGA, STATUS_CANDIDATURA,
    lerSessao, api, el, icone, badge, rotuloProfissao, formatarData, formatarMoeda,
    descreverPrazo, paraISO, mostrarAlerta, cartaoAviso,
  };
})();

window.FW = FW;
