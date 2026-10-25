// Modelo de usuario com validação 
export const usuarioModel = {
    id: "uuid",
    nome: "string (3-50 caracteres)",
    email: "string (único, Validado)",
    cpf: "string (unico, 11 dígitos)",
    telefone: "string (formato (12) 12365-5478)",
    endereco: "string ",
    cidade: "string ",
    uf: "string (2 caracteres)",
    cep: "string (5-3 caracteres)",
    profissao: "string",
    experiencia: "string",
    habilidades: "text",
    disponibilidade: "string",
    dataCadastro: "timestamp",
    ativo: "boolean"
};