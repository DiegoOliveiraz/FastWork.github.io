// Exemplo de Model
// Define a estrutura dos dados

export class Usuario {
  constructor(id, nome, email, senha) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
  }

  // Exemplo de método
  static findByEmail(email) {
    // Aqui você buscaria no banco de dados
    return { email, nome: 'Usuário' };
  }

  static create(dados) {
    // Criar novo usuário
    return new Usuario(1, dados.nome, dados.email, dados.senha);
  }
}

export class Emprego {
  constructor(id, titulo, descricao, salario) {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.salario = salario;
  }

  static findAll() {
    // Buscar todos os empregos
    return [];
  }

  static findById(id) {
    // Buscar emprego por ID
    return null;
  }
}
