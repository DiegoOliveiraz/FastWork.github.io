// Monta as páginas institucionais (ajuda, legal, cookies, etc.) a partir de
// paginas-institucionais.js. Endereço: institucional.html?pagina=<chave>
// Todo texto entra via textContent/createElement, sem innerHTML.
(function montarPaginaInstitucional() {
  const params = new URLSearchParams(window.location.search);
  const chave = params.get("pagina") ?? "";
  const existe = Object.hasOwn(PAGINAS_INSTITUCIONAIS, chave);
  const pagina = PAGINAS_INSTITUCIONAIS[existe ? chave : "nao-encontrada"];

  function el(tag, classe, texto) {
    const no = document.createElement(tag);
    if (classe) no.className = classe;
    if (texto) no.textContent = texto;
    return no;
  }

  document.title = `${pagina.titulo} - FastWork`;

  // Marca no menu a página atual (só Ajuda e Legal estão no menu).
  const itemAtivo = document.querySelector(`.nav-link[data-pagina="${CSS.escape(chave)}"]`);
  if (itemAtivo) {
    itemAtivo.classList.add("active");
    itemAtivo.setAttribute("aria-current", "page");
  }

  // Cabeçalho da página
  const apresentacao = el("section", "text-center py-5 mb-5");
  apresentacao.appendChild(el("p", "text-primary text-uppercase fw-semibold mb-2", pagina.chamada));
  apresentacao.appendChild(el("h1", "display-5 fw-bold mb-3", pagina.cabecalho));
  apresentacao.appendChild(el("p", "lead text-white-50 mx-auto resumo-pagina", pagina.resumo));

  // Cartões: 2 cartões ocupam metade da linha, 3 ou mais ocupam um terço.
  const colunaClasse = pagina.cartoes.length === 2 ? "col-md-6" : "col-md-4";
  const cartoes = el("section", "row g-4");
  for (const dados of pagina.cartoes) {
    const coluna = el("div", colunaClasse);
    const cartao = el("div", "card bg-black border-primary h-100");
    const corpo = el("div", pagina.centralizado ? "card-body p-4 text-center" : "card-body p-4");

    if (dados.icone) {
      const icone = el("i", `bi ${dados.icone} display-6 text-primary`);
      icone.setAttribute("aria-hidden", "true");
      corpo.appendChild(icone);
    }
    corpo.appendChild(el("h2", dados.icone ? "h4 mt-3" : "h4", dados.titulo));
    corpo.appendChild(el("p", "text-white-50 mb-0", dados.texto));

    cartao.appendChild(corpo);
    coluna.appendChild(cartao);
    cartoes.appendChild(coluna);
  }

  // Atalhos opcionais (usados em "Legal")
  if (pagina.atalhos) {
    const coluna = el("div", "col-12");
    const cartao = el("div", "card bg-black border-primary");
    const corpo = el("div", "card-body p-4");
    corpo.appendChild(el("h2", "h4", "Acesso rápido"));
    const grupo = el("div", "d-flex flex-wrap gap-2");
    for (const atalho of pagina.atalhos) {
      const link = el("a", "btn btn-outline-primary", atalho.texto);
      link.href = `institucional.html?pagina=${encodeURIComponent(atalho.pagina)}`;
      grupo.appendChild(link);
    }
    corpo.appendChild(grupo);
    cartao.appendChild(corpo);
    coluna.appendChild(cartao);
    cartoes.appendChild(coluna);
  }

  document.getElementById("conteudo").replaceChildren(apresentacao, cartoes);
})();
