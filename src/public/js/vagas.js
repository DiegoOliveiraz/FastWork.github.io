// Página de vagas (vagas.html): lista as vagas abertas e permite ao PROFISSIONAL se candidatar.
// Regras de verdade ficam no servidor; aqui só mostramos o resultado (botão desabilitado = aviso).
(function paginaVagas() {
  const { el, icone, badge, api, mostrarAlerta } = FW;
  const sessao = FW.lerSessao();
  const ehProfissional = sessao?.tipo === "profissional";
  const ehEmpresa = sessao?.tipo === "empresa";

  const $ = (id) => document.getElementById(id);
  const estado = { pagina: 1, perfilProfissao: null, vagaSelecionada: null };
  const modal = new bootstrap.Modal($("modalCandidatura"));

  // ── Quem está vendo a página ────────────────────────────────────────────────────
  if (ehEmpresa) $("linkPainel").classList.remove("d-none");

  if (!sessao) {
    $("aviso").replaceChildren(
      FW.cartaoAviso("Entre para ver as vagas", "Faça login como profissional para se candidatar.", "Entrar", "login.html"),
    );
    return;
  }
  if (ehEmpresa) {
    $("aviso").replaceChildren(
      FW.cartaoAviso(
        "Esta página é para profissionais",
        "Contas de empresa publicam e gerenciam vagas pelo painel.",
        "Abrir painel de vagas",
        "admin-vagas.html",
      ),
    );
  }

  $("areaVagas").classList.remove("d-none");
  if (ehProfissional) $("areaCandidaturas").classList.remove("d-none");

  // ── Montagem dos cartões ────────────────────────────────────────────────────────
  function linhaInfo(nomeIcone, texto) {
    const li = el("li", "d-flex align-items-start gap-2 mb-1");
    li.append(icone(nomeIcone, "text-primary"), el("span", "", texto));
    return li;
  }

  function botaoDaVaga(vaga) {
    if (!ehProfissional) return null;

    const botao = el("button", "btn w-100");
    botao.type = "button";
    if (vaga.ja_candidatou) {
      botao.className = "btn btn-outline-success w-100";
      botao.disabled = true;
      botao.append(icone("bi-check-circle"), " Candidatura enviada");
    } else if (vaga.compativel === false) {
      botao.className = "btn btn-outline-secondary w-100";
      botao.disabled = true;
      botao.append(icone("bi-slash-circle"), ` Exige: ${FW.rotuloProfissao(vaga.nm_cargo)}`);
    } else {
      botao.className = "btn btn-primary w-100";
      botao.append(icone("bi-send"), " Candidatar-se");
      botao.addEventListener("click", () => abrirCandidatura(vaga));
    }
    return botao;
  }

  function cartaoVaga(vaga) {
    const coluna = el("div", "col-md-6 col-lg-4");
    const cartao = el("div", "card bg-black border-primary h-100");
    const corpo = el("div", "card-body p-4 d-flex flex-column");

    const topo = el("div", "d-flex justify-content-between align-items-start mb-2 gap-2");
    topo.append(
      badge(["bg-primary", FW.rotuloProfissao(vaga.nm_cargo)], "text-uppercase"),
      badge(FW.SITUACOES_VAGA[vaga.situacao] ?? ["bg-secondary", vaga.situacao]),
    );
    corpo.appendChild(topo);

    corpo.appendChild(el("h2", "h5 mb-1", `Vaga de ${FW.rotuloProfissao(vaga.nm_cargo)}`));
    corpo.appendChild(el("p", "text-white-50 small mb-3", vaga.nm_empresa));

    const lista = el("ul", "list-unstyled small text-white-50 mb-3");
    const local = [vaga.ds_cidade, vaga.ds_estado].filter(Boolean).join(" - ");
    if (local) lista.appendChild(linhaInfo("bi-geo-alt", local));
    const tipoContrato = [vaga.tp_contrato, vaga.tp_modalidade].filter(Boolean).join(" · ");
    if (tipoContrato) lista.appendChild(linhaInfo("bi-briefcase", tipoContrato));
    lista.appendChild(linhaInfo("bi-cash-coin", FW.formatarMoeda(vaga.vl_salario)));
    lista.appendChild(linhaInfo("bi-calendar-event", FW.descreverPrazo(vaga)));
    corpo.appendChild(lista);

    if (vaga.ds_descricao) corpo.appendChild(el("p", "texto-truncado mb-3", vaga.ds_descricao));

    const rodapeCartao = el("div", "mt-auto");
    const botao = botaoDaVaga(vaga);
    if (botao) rodapeCartao.appendChild(botao);
    corpo.appendChild(rodapeCartao);

    cartao.appendChild(corpo);
    coluna.appendChild(cartao);
    return coluna;
  }

  // ── Lista de vagas ──────────────────────────────────────────────────────────────
  async function carregarVagas({ reiniciar }) {
    if (reiniciar) estado.pagina = 1;

    const parametros = new URLSearchParams({ pagina: String(estado.pagina) });
    if ($("filtroProfissao").value) parametros.set("profissao", $("filtroProfissao").value);
    if ($("filtroCidade").value.trim()) parametros.set("cidade", $("filtroCidade").value.trim());
    if ($("filtroCompativeis").checked) parametros.set("compativeis", "true");

    const resposta = await api(`/vagas?${parametros}`);
    if (!resposta.ok) {
      mostrarAlerta($("alerta"), "danger", resposta.dados.erro || "Não foi possível carregar as vagas.");
      return;
    }
    const { vagas, total, por_pagina: porPagina, perfil } = resposta.dados;

    if (perfil) {
      estado.perfilProfissao = perfil.ds_profissao;
      $("perfilProfissao").textContent = FW.rotuloProfissao(perfil.ds_profissao);
      $("blocoCompativeis").classList.remove("d-none");
    }

    const cartoes = vagas.map(cartaoVaga);
    if (reiniciar) $("listaVagas").replaceChildren(...cartoes);
    else $("listaVagas").append(...cartoes);

    const mostradas = $("listaVagas").children.length;
    $("contagem").textContent = total === 0
      ? "Nenhuma vaga aberta com esses filtros."
      : `Mostrando ${mostradas} de ${total} vaga(s).`;
    $("blocoMais").classList.toggle("d-none", estado.pagina * porPagina >= total);
  }

  $("formFiltro").addEventListener("submit", (e) => {
    e.preventDefault();
    carregarVagas({ reiniciar: true });
  });
  $("filtroCompativeis").addEventListener("change", () => carregarVagas({ reiniciar: true }));
  $("btnMais").addEventListener("click", () => {
    estado.pagina += 1;
    carregarVagas({ reiniciar: false });
  });

  // ── Candidatura ─────────────────────────────────────────────────────────────────
  function abrirCandidatura(vaga) {
    estado.vagaSelecionada = vaga;
    $("alertaModal").replaceChildren();
    $("carta").value = "";
    $("resumoVagaTitulo").textContent = `Vaga de ${FW.rotuloProfissao(vaga.nm_cargo)} · ${vaga.nm_empresa}`;
    $("resumoVagaDetalhes").textContent =
      `${[vaga.ds_cidade, vaga.ds_estado].filter(Boolean).join(" - ") || "Local a combinar"} · ${FW.formatarMoeda(vaga.vl_salario)}`;
    modal.show();
  }

  $("formCandidatura").addEventListener("submit", async (e) => {
    e.preventDefault();
    const vaga = estado.vagaSelecionada;
    if (!vaga) return;

    const botao = $("btnConfirmarCandidatura");
    botao.disabled = true;
    const resposta = await api(`/vagas/${vaga.id_vaga}/candidaturas`, {
      metodo: "POST",
      corpo: { ds_carta_apresentacao: $("carta").value.trim() },
    });
    botao.disabled = false;

    if (!resposta.ok) {
      mostrarAlerta($("alertaModal"), "danger", resposta.dados.erro || "Não foi possível enviar a candidatura.");
      return;
    }
    modal.hide();
    mostrarAlerta($("alerta"), "success", "Candidatura enviada! Acompanhe o andamento em “Minhas candidaturas”.");
    await Promise.all([carregarVagas({ reiniciar: true }), carregarMinhasCandidaturas()]);
  });

  // ── Minhas candidaturas ─────────────────────────────────────────────────────────
  async function carregarMinhasCandidaturas() {
    if (!ehProfissional) return;
    const resposta = await api("/candidaturas/minhas");
    if (!resposta.ok) return;

    const itens = resposta.dados.candidaturas.map((c) => {
      const coluna = el("div", "col-md-6");
      const cartao = el("div", "card bg-black border-primary h-100");
      const corpo = el("div", "card-body p-3");
      const linha = el("div", "d-flex justify-content-between align-items-start gap-2");
      const textos = el("div");
      textos.append(
        el("p", "fw-semibold mb-0", `Vaga de ${FW.rotuloProfissao(c.nm_cargo)}`),
        el("p", "text-white-50 small mb-0", `${c.nm_empresa} · enviada em ${FW.formatarData(c.dt_candidatura)}`),
      );
      linha.append(textos, badge(FW.STATUS_CANDIDATURA[c.st_candidatura] ?? ["bg-secondary", c.st_candidatura]));
      corpo.appendChild(linha);
      cartao.appendChild(corpo);
      coluna.appendChild(cartao);
      return coluna;
    });

    $("listaCandidaturas").replaceChildren(
      ...(itens.length ? itens : [el("p", "text-white-50", "Você ainda não se candidatou a nenhuma vaga.")]),
    );
  }

  carregarVagas({ reiniciar: true });
  carregarMinhasCandidaturas();
})();
