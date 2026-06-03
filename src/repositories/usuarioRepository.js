import usuarios from "../database/usuarios.json" with { type: "json" };
import fs from "fs";
import path from "path";

const usuarioRepository = {
  readAll() {
    return usuarios.filter(u => u.ativo);
  },

  readById(id) {
    return usuarios.find((u) => u.id === id && u.ativo);
  },

  emailExiste(email) {
    return usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase() && u.ativo);
  },

  cpfExiste(cpf) {
    return usuarios.some((u) => u.cpf === cpf && u.ativo);
  },

  buscaPorEmail(email) {
    return usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  create(usuario) {
    const novoUsuario = {
      id: `user_${Date.now()}`,
      ...usuario,
      dataCadastro: new Date().toISOString(),
      ativo: true,
    };
    usuarios.push(novoUsuario);
    this.salvarEmArquivo();
    return novoUsuario;
  },

  update(id, dados) {
    const indice = usuarios.findIndex((u) => u.id === id);
    if (indice === -1) return null;
    usuarios[indice] = { ...usuarios[indice], ...dados };
    this.salvarEmArquivo();
    const { senha, ...dadosSemSenha } = usuarios[indice];
    return dadosSemSenha;
  },

  deactivate(id) {
    const indice = usuarios.findIndex((u) => u.id === id);
    if (indice === -1) return false;
    usuarios[indice].ativo = false;
    this.salvarEmArquivo();
    return true;
  },

  salvarEmArquivo() {
    const caminhoDb = path.join(process.cwd(), "src", "database", "usuarios.json");
    fs.writeFileSync(caminhoDb, JSON.stringify(usuarios, null, 2));
  }
};

export default usuarioRepository;