const servicos = [
  { nome: "Eletricista", icone: "lightning-charge", categoria: "Casa", popular: true },
  { nome: "Encanador", icone: "wrench", categoria: "Casa", popular: true },
  { nome: "Pedreiro", icone: "hammer", categoria: "Casa", popular: true },
  { nome: "Pintor", icone: "brush", categoria: "Casa", popular: true },
  { nome: "Marceneiro", icone: "tools", categoria: "Casa" },
  { nome: "Chaveiro", icone: "key", categoria: "Casa" },
  { nome: "Montador de móveis", icone: "box-seam", categoria: "Casa", popular: true },
  { nome: "Ar-condicionado", icone: "snow", categoria: "Casa" },
  { nome: "Diarista", icone: "bucket", categoria: "Limpeza", popular: true },
  { nome: "Jardineiro", icone: "tree", categoria: "Limpeza", popular: true },
  { nome: "Dedetizador", icone: "bug", categoria: "Limpeza" },
  { nome: "Piscineiro", icone: "water", categoria: "Limpeza" },
  { nome: "Lavagem de estofados", icone: "droplet", categoria: "Limpeza" },
  { nome: "Técnico de informática", icone: "pc-display", categoria: "Tecnologia", popular: true },
  { nome: "Instalador de câmeras", icone: "camera-video", categoria: "Tecnologia" },
  { nome: "Conserto de celular", icone: "phone", categoria: "Tecnologia" },
  { nome: "Cuidador de idosos", icone: "heart-pulse", categoria: "Pessoas" },
  { nome: "Babá", icone: "balloon-heart", categoria: "Pessoas" },
  { nome: "Passeador de cães", icone: "heart", categoria: "Pessoas" },
  { nome: "Professor particular", icone: "book", categoria: "Pessoas" },
  { nome: "Freteiro", icone: "truck", categoria: "Transporte" },
  { nome: "Mudanças", icone: "box-seam", categoria: "Transporte" },
  { nome: "Entregador", icone: "bicycle", categoria: "Transporte" },
  { nome: "Mecânico", icone: "gear", categoria: "Transporte" },
  { nome: "Cabeleireiro", icone: "scissors", categoria: "Beleza e eventos" },
  { nome: "Manicure", icone: "gem", categoria: "Beleza e eventos" },
  { nome: "Fotógrafo", icone: "camera", categoria: "Beleza e eventos" },
  { nome: "DJ", icone: "music-note-beamed", categoria: "Beleza e eventos" },
  { nome: "Churrasqueiro", icone: "fire", categoria: "Beleza e eventos" },
];

const categorias = [
  "Populares",
  "Casa",
  "Limpeza",
  "Tecnologia",
  "Pessoas",
  "Transporte",
  "Beleza e eventos",
];

function inicializarServicos() {
  const grid = document.getElementById("grid");
  const chips = document.getElementById("chips");

  if (!grid || !chips) {
    return;
  }

  function exibirServicos(categoria) {
    const lista = (categoria === "Populares"
      ? servicos.filter((servico) => servico.popular)
      : servicos.filter((servico) => servico.categoria === categoria)
    ).slice(0, 8);

    grid.classList.remove("play");
    grid.innerHTML = lista
      .map(
        (servico, indice) => `
          <div class="col">
            <a class="svc" style="--i:${indice}" href="src/views/contrato_new.html">
              <i class="bi bi-${servico.icone}" aria-hidden="true"></i>
              <span>${servico.nome}</span>
            </a>
          </div>
        `,
      )
      .join("");
    void grid.offsetWidth;
    grid.classList.add("play");
  }

  categorias.forEach((categoria, indice) => {
    const botao = document.createElement("button");
    botao.className = "chip";
    botao.type = "button";
    botao.textContent = categoria;
    botao.setAttribute("aria-pressed", String(indice === 0));
    botao.addEventListener("click", () => {
      exibirServicos(categoria);
      chips.querySelectorAll(".chip").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === botao));
      });
    });
    chips.appendChild(botao);
  });

  exibirServicos("Populares");
}

document.addEventListener("DOMContentLoaded", inicializarServicos);
