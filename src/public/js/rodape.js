// Rodapé compartilhado do FastWork.
// Uso: <footer id="rodape" class="..." ></footer>
//      <script src="caminho/rodape.js" data-base="src/views/"></script>
// data-base é o prefixo para chegar em src/views/ a partir da página atual:
//   index.html (raiz)      -> data-base="src/views/"
//   páginas em src/views/  -> data-base="" (ou omitido)
(function montarRodape() {
  const base = document.currentScript?.dataset.base ?? "";
  const rodape = document.getElementById("rodape");
  if (!rodape) return;

  const inst = (pagina) => `${base}institucional.html?pagina=${pagina}`;

  const colunas = [
    {
      titulo: "FastWork",
      links: [
        ["Sobre", `${base}sobre.html`],
        ["Vagas", `${base}vagas.html`],
        ["Empregos", inst("empregos")],
      ],
    },
    {
      titulo: "Comunidades",
      links: [
        ["Desenvolvedores", `${base}Dev.html`],
        ["Publicidade", inst("publicidade")],
        ["Investidores", inst("investidores")],
        ["Fornecedores", inst("fornecedores")],
      ],
    },
    {
      titulo: "Links úteis",
      links: [
        ["Suporte", inst("ajuda")],
        ["Legal", inst("legal")],
        ["Segurança e privacidade", inst("seguranca")],
        ["Políticas de privacidade", inst("politicas")],
        ["Cookies", inst("cookies")],
        ["Acessibilidade", inst("acessibilidade")],
      ],
    },
  ];

  const redes = [
    ["Instagram do FastWork", "bi-instagram", "https://www.instagram.com/fast_work2025.1/", true],
    ["Facebook", "bi-facebook", "#", false],
    ["Twitter", "bi-twitter-x", "#", false],
  ];

  function el(tag, classe, texto) {
    const no = document.createElement(tag);
    if (classe) no.className = classe;
    if (texto) no.textContent = texto;
    return no;
  }

  const container = el("div", "container");
  const linha = el("div", "row gy-4");

  for (const coluna of colunas) {
    const col = el("div", "col-6 col-md-3");
    col.appendChild(el("h5", "text-primary", coluna.titulo));
    for (const [texto, href] of coluna.links) {
      const a = el("a", "d-block link-light link-opacity-75 text-decoration-none", texto);
      a.href = href;
      col.appendChild(a);
    }
    linha.appendChild(col);
  }

  const colRedes = el("div", "col-6 col-md-3");
  colRedes.appendChild(el("h5", "text-primary", "Redes sociais"));
  const grupo = el("div", "d-flex gap-2");
  for (const [rotulo, icone, href, externo] of redes) {
    const a = el("a", "btn btn-outline-light btn-sm rounded-circle");
    a.href = href;
    a.setAttribute("aria-label", rotulo);
    if (externo) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    const i = el("i", `bi ${icone}`);
    i.setAttribute("aria-hidden", "true");
    a.appendChild(i);
    grupo.appendChild(a);
  }
  colRedes.appendChild(grupo);
  linha.appendChild(colRedes);

  container.appendChild(linha);
  container.appendChild(
    el(
      "p",
      "text-center text-white-50 small mt-4 pt-3 border-top border-primary mb-0",
      "© 2025–2026 FastWork · Todos os direitos reservados",
    ),
  );
  rodape.replaceChildren(container);
})();
