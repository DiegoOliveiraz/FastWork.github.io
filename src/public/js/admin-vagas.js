// Painel de vagas da empresa (admin-vagas.html).
// A tela só esconde o que a conta não pode usar; quem GARANTE a permissão é o servidor
// (exigirTipo('empresa') + dono da vaga em cada rota).
(function painelDeVagas() {
  const { el, icone, badge, api, mostrarAlerta } = FW;
  const sessao = FW.lerSessao();
  const $ = (id) => document.getElementById(id);

  if (!sessao) {
    $("aviso").replaceChildren(
      FW.cartaoAviso("Entre como empresa", "O painel de vagas é exclusivo para contas de empresa.", "Entrar", "login.html"),
    );
    return;
  }
  if (sessao.tipo !== "empresa") {
    $("aviso").replaceChildren(
      FW.cartaoAviso("Acesso restrito", "Somente contas de empresa gerenciam vagas. Você pode ver as vagas abertas.", "Ver vagas", "vagas.html"),
    );
    return;
  }
  $("painel").classList.remove("d-none");

  const modalCandidatos = new bootstrap.Modal($("modalCandidatos"));
  const modalSugestoes = new bootstrap.Modal($("modalSugestoes"));
  let vagaAberta = null; // vaga cujo modal de candidatos está aberto

  const mensagemDe = (resposta, padrao) => resposta.dados.erro || padrao;

  // ── Números gerais ──────────────────────────────────────────────────────────────
  async function carregarEstatisticas() {
    const resposta = await api("/relatorios/empresa-resumo");
    if (!resposta.ok) return;
    const r = resposta.dados.resumo;
    const itens = [
      ["Vagas", r.total_vagas, "bi-briefcase"],
      ["Abertas", r.vagas_abertas, "bi-unlock"],
      ["Candidaturas", r.total_candidaturas, "bi-people"],
      ["Aprovadas", r.aprovadas, "bi-check2-circle"],
      ["Sem candidatos", r.vagas_sem_candidatos, "bi-hourglass-split"],
    ];
    $("estatisticas").replaceChildren(...itens.map(([nome, valor, nomeIcone]) => {
      const col = el("div", "col");
      const cartao = el("div", "card bg-black border-primary h-100 text-center");
      const corpo = el("div", "card-body p-3");
      corpo.append(icone(nomeIcone, "fs-4 text-primary"), el("p", "h3 mb-0", String(valor)), el("p", "text-white-50 small mb-0", nome));
      cartao.appendChild(corpo);
      col.appendChild(cartao);
      return col;
    }));
  }

  // ── Minhas vagas ────────────────────────────────────────────────────────────────
  function botao(classe, nomeIcone, texto, aoClicar, desabilitado = false) {
    const b = el("button", `btn btn-sm ${classe}`);
    b.type = "button";
    b.append(icone(nomeIcone), ` ${texto}`);
    b.disabled = desabilitado;
    b.addEventListener("click", aoClicar);
    return b;
  }

  function cartaoVaga(vaga) {
    const coluna = el("div", "col-12");
    const cartao = el("div", "card bg-black border-primary");
    const corpo = el("div", "card-body p-3");

    const topo = el("div", "d-flex justify-content-between align-items-start gap-2 mb-2");
    topo.append(
      el("h3", "h5 mb-0", `Vaga de ${FW.rotuloProfissao(vaga.nm_cargo)}`),
      badge(FW.SITUACOES_VAGA[vaga.situacao] ?? ["bg-secondary", vaga.situacao]),
    );
    corpo.appendChild(topo);

    const local = [vaga.ds_cidade, vaga.ds_estado].filter(Boolean).join(" - ");
    corpo.appendChild(el("p", "text-white-50 small mb-2", [local, FW.formatarMoeda(vaga.vl_salario)].filter(Boolean).join(" · ")));
    corpo.appendChild(el("p", "text-white-50 small mb-2", FW.descreverPrazo(vaga)));

    const contagens = el("div", "d-flex flex-wrap gap-2 mb-3");
    contagens.append(
      badge(["bg-secondary", `${vaga.pendentes} pendente(s)`]),
      badge(["bg-info text-dark", `${vaga.em_analise} em análise`]),
      badge(["bg-success", `${vaga.aprovadas} aprovada(s)`]),
      badge(["bg-danger", `${vaga.rejeitadas} rejeitada(s)`]),
    );
    corpo.appendChild(contagens);

    const encerrada = vaga.st_vaga === "fechada";
    const acoes = el("div", "d-flex flex-wrap gap-2");
    acoes.append(
      botao("btn-primary", "bi-people", `Candidatos (${vaga.total_candidaturas})`, () => abrirCandidatos(vaga)),
      botao("btn-outline-light", "bi-person-plus", "Sugestões", () => abrirSugestoes(vaga), encerrada),
      botao("btn-outline-danger", "bi-lock", "Fechar vaga", () => fecharVaga(vaga), encerrada),
    );
    corpo.appendChild(acoes);

    cartao.appendChild(corpo);
    coluna.appendChild(cartao);
    return coluna;
  }

  async function carregarVagas() {
    const resposta = await api("/vagas/minhas");
    if (!resposta.ok) {
      mostrarAlerta($("alerta"), "danger", mensagemDe(resposta, "Não foi possível carregar suas vagas."));
      return;
    }
    const cartoes = resposta.dados.vagas.map(cartaoVaga);
    $("listaVagas").replaceChildren(
      ...(cartoes.length ? cartoes : [el("p", "text-white-50", "Você ainda não publicou nenhuma vaga.")]),
    );
  }

  const recarregarTudo = () => Promise.all([carregarEstatisticas(), carregarVagas()]);

  // ── Criar vaga ──────────────────────────────────────────────────────────────────
  function paraInputLocal(data) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${pad(data.getHours())}:${pad(data.getMinutes())}`;
  }
  $("vAbertura").min = paraInputLocal(new Date());
  $("vEncerramento").min = paraInputLocal(new Date());

  $("formVaga").addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const form = e.target;
    $("alertaForm").replaceChildren();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const abertura = FW.paraISO($("vAbertura").value);
    const encerramento = FW.paraISO($("vEncerramento").value);
    const referencia = abertura ? new Date(abertura) : new Date();
    if (encerramento && new Date(encerramento) <= referencia) {
      mostrarAlerta($("alertaForm"), "danger", "A data de fechamento deve ser depois da data de abertura.");
      return;
    }

    const salario = $("vSalario").value;
    $("btnCriar").disabled = true;
    const resposta = await api("/vagas", {
      metodo: "POST",
      corpo: {
        nm_cargo: $("vTipo").value,
        ds_descricao: $("vDescricao").value.trim(),
        ds_requisitos: $("vRequisitos").value.trim(),
        tp_contrato: $("vContrato").value,
        tp_modalidade: $("vModalidade").value,
        vl_salario: salario === "" ? undefined : Number(salario),
        ds_cidade: $("vCidade").value.trim(),
        ds_estado: $("vEstado").value.trim(),
        dt_publicacao: abertura,
        dt_encerramento: encerramento,
      },
    });
    $("btnCriar").disabled = false;

    if (!resposta.ok) {
      mostrarAlerta($("alertaForm"), "danger", mensagemDe(resposta, "Não foi possível publicar a vaga."));
      return;
    }
    form.reset();
    form.classList.remove("was-validated");
    mostrarAlerta($("alertaForm"), "success", "Vaga publicada com sucesso!");
    await recarregarTudo();
  });

  // ── Fechar vaga ─────────────────────────────────────────────────────────────────
  async function fecharVaga(vaga) {
    const emAndamento = vaga.pendentes + vaga.em_analise;
    const aviso = emAndamento > 0
      ? ` ${emAndamento} candidatura(s) em andamento serão rejeitadas.`
      : "";
    if (!window.confirm(`Fechar a vaga de ${FW.rotuloProfissao(vaga.nm_cargo)}?${aviso}`)) return;

    const resposta = await api(`/vagas/${vaga.id_vaga}/encerrar`, { metodo: "PATCH" });
    if (!resposta.ok) {
      mostrarAlerta($("alerta"), "danger", mensagemDe(resposta, "Não foi possível fechar a vaga."));
    } else {
      mostrarAlerta($("alerta"), "success", `Vaga encerrada. ${resposta.dados.candidaturas_rejeitadas} candidatura(s) rejeitada(s).`);
    }
    await recarregarTudo();
  }

  // ── Candidatos ──────────────────────────────────────────────────────────────────
  function celula(...filhos) {
    const td = el("td");
    td.append(...filhos);
    return td;
  }

  function linhaCandidato(c, vaga) {
    const tr = el("tr");

    const pessoa = el("div");
    pessoa.append(el("p", "fw-semibold mb-0", c.nm_usuario));
    pessoa.append(el("p", "text-white-50 small mb-0", `${c.ds_email} · ${c.ds_telefone || "sem telefone"}`));
    if (c.ds_carta_apresentacao) pessoa.append(el("p", "small fst-italic mb-0", `“${c.ds_carta_apresentacao}”`));

    const acoes = el("td", "text-end");
    const decidivel = ["pendente", "em_analise"].includes(c.st_candidatura) && vaga.st_vaga !== "fechada";
    if (decidivel) {
      const grupo = el("div", "d-flex flex-wrap gap-2 justify-content-end");
      if (c.st_candidatura === "pendente") {
        grupo.append(botao("btn-outline-info", "bi-search", "Em análise", () => analisar(c)));
      }
      grupo.append(botao("btn-success", "bi-check2", "Aprovar", () => aprovar(c)));
      acoes.appendChild(grupo);
    }

    tr.append(
      celula(el("span", "fw-bold", String(c.posicao))),
      celula(pessoa),
      celula(el("span", "", `${c.nr_experiencia ?? 0} ano(s)`)),
      celula(el("span", "", [c.ds_cidade, c.ds_estado].filter(Boolean).join(" - ") || "—")),
      celula(badge(FW.STATUS_CANDIDATURA[c.st_candidatura] ?? ["bg-secondary", c.st_candidatura])),
      acoes,
    );
    return tr;
  }

  async function carregarCandidatos() {
    const resposta = await api(`/vagas/${vagaAberta.id_vaga}/candidaturas`);
    if (!resposta.ok) {
      mostrarAlerta($("alertaCandidatos"), "danger", mensagemDe(resposta, "Não foi possível carregar os candidatos."));
      return;
    }
    const linhas = resposta.dados.candidatos.map((c) => linhaCandidato(c, vagaAberta));
    if (linhas.length === 0) {
      const vazia = el("tr");
      const td = el("td", "text-white-50 text-center", "Nenhuma candidatura ainda.");
      td.colSpan = 6;
      vazia.appendChild(td);
      linhas.push(vazia);
    }
    $("tabelaCandidatos").replaceChildren(...linhas);
  }

  async function abrirCandidatos(vaga) {
    vagaAberta = vaga;
    $("alertaCandidatos").replaceChildren();
    $("modalCandidatosTitulo").textContent = `Candidatos · vaga de ${FW.rotuloProfissao(vaga.nm_cargo)}`;
    modalCandidatos.show();
    await carregarCandidatos();
  }

  async function analisar(candidato) {
    const resposta = await api(`/candidaturas/${candidato.id_candidatura}/analisar`, { metodo: "PATCH" });
    if (!resposta.ok) mostrarAlerta($("alertaCandidatos"), "danger", mensagemDe(resposta, "Não foi possível atualizar."));
    await Promise.all([carregarCandidatos(), recarregarTudo()]);
  }

  async function aprovar(candidato) {
    if (!window.confirm(`Aprovar ${candidato.nm_usuario}? As demais candidaturas serão rejeitadas e a vaga será encerrada.`)) return;
    const resposta = await api(`/candidaturas/${candidato.id_candidatura}/aprovar`, { metodo: "PATCH" });
    if (!resposta.ok) {
      mostrarAlerta($("alertaCandidatos"), "danger", mensagemDe(resposta, "Não foi possível aprovar."));
    } else {
      mostrarAlerta($("alertaCandidatos"), "success", `${candidato.nm_usuario} aprovado(a). Vaga encerrada.`);
      vagaAberta = { ...vagaAberta, st_vaga: "fechada" };
    }
    await Promise.all([carregarCandidatos(), recarregarTudo()]);
  }

  // ── Sugestões (subconsulta NOT EXISTS) ──────────────────────────────────────────
  async function abrirSugestoes(vaga) {
    $("modalSugestoesTitulo").textContent = `Sugestões · vaga de ${FW.rotuloProfissao(vaga.nm_cargo)}`;
    const resposta = await api(`/relatorios/vagas/${vaga.id_vaga}/profissionais-compativeis`);
    if (!resposta.ok) {
      mostrarAlerta($("alerta"), "danger", mensagemDe(resposta, "Não foi possível carregar as sugestões."));
      return;
    }
    const linhas = resposta.dados.profissionais.map((p) => {
      const tr = el("tr");
      tr.append(
        celula(el("span", "fw-semibold", p.nm_usuario)),
        celula(el("span", "", `${p.nr_experiencia ?? 0} ano(s)`)),
        celula(el("span", "", [p.ds_cidade, p.ds_estado].filter(Boolean).join(" - ") || "—")),
        el("td", "text-end", String(p.candidaturas_em_andamento)),
      );
      return tr;
    });
    if (linhas.length === 0) {
      const vazia = el("tr");
      const td = el("td", "text-white-50 text-center", "Nenhum profissional disponível sem candidatura nesta vaga.");
      td.colSpan = 4;
      vazia.appendChild(td);
      linhas.push(vazia);
    }
    $("tabelaSugestoes").replaceChildren(...linhas);
    modalSugestoes.show();
  }

  // ── Demanda x oferta (CTE + FULL JOIN) ──────────────────────────────────────────
  async function carregarDemanda() {
    const resposta = await api("/relatorios/demanda-oferta");
    if (!resposta.ok) return;
    const linhas = resposta.dados.profissoes.map((p) => {
      const tr = el("tr");
      tr.append(
        celula(el("span", "fw-semibold", FW.rotuloProfissao(p.profissao))),
        el("td", "text-end", String(p.vagas_abertas)),
        el("td", "text-end", String(p.profissionais_disponiveis)),
        el("td", "text-end", p.vagas_por_profissional === null ? "—" : String(p.vagas_por_profissional)),
      );
      return tr;
    });
    $("tabelaDemanda").replaceChildren(...linhas);
  }
  $("btnDemanda").addEventListener("click", carregarDemanda);

  recarregarTudo();
  carregarDemanda();
})();
