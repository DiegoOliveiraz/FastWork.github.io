import usuarios from "../database/usuarios.json" with { type: "json" };
import fs from "fs";
import path from "path";

const usuarioRepository = {
  //Buscar todos
  readAll() {
    return usuarios;
  },
  //buscar por ID
  readById(id) {
    return usuarios.find((u) => u.id === id);
  },

  //verificar email duplicado
  emailExiste(email) {
    return usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  //verificar cpf duplicado
  cpfExiste(cpf) {
    return usuarios.some((u) => u.cpf === cpf);
  },

  //criar novo usúario
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

  // salvar em arquivo
  salvarEmArquivo() {
    const caminhoDb = path.join(
      process.cwd(),
      "src",
      "database",
      "usuario.json",
    );
    fs.writeFileSync(caminhoDb, JSON.stringify(usuarios, null, 2));
  }
};

export default usuarioRepository;