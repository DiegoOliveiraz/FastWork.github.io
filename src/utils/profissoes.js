// Tipos de profissão aceitos nas vagas. Mantenha igual às opções do <select id="profissao">
// de formu.html e à constante PROFISSOES de src/public/js/vagas-comum.js.
export const PROFISSOES = [
  "pedreiro",
  "eletricista",
  "encanador",
  "pintor",
  "carpinteiro",
  "outro",
];

// "Babá", " BABA " e "baba" viram a mesma coisa: minúsculo, sem acento, sem espaços nas pontas.
export function normalizarTexto(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// Regra de candidatura: a profissão do perfil precisa ser a mesma do tipo da vaga.
export function profissaoCompativel(profissaoDoProfissional, tipoDaVaga) {
  const perfil = normalizarTexto(profissaoDoProfissional);
  return perfil !== "" && perfil === normalizarTexto(tipoDaVaga);
}
