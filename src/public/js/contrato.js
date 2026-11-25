document.querySelectorAll("[data-contratado]").forEach((botao) => {
  botao.addEventListener("click", () => {
    alert(`Contato iniciado com ${botao.dataset.contratado}!`);
  });
});
