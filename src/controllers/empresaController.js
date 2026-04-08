import empresaRepository from "../repositories/empresaRepository.js";

export function cadastrarEmpresa(req, res) {
  const { nome, cnpj, email, telefone, endereco, setor } = req.body;

  if (!nome || !cnpj || !email || !telefone) {
    return res.status(400).json({
      ok: false,
      erro: "campos obrigatórios não preenchidos",
    });
  }

  if (empresaRepository.emailExiste(email)) {
    return res.status(400).json({
      ok: false,
      erro: "Email já cadastrado",
    });
  }

  if (empresaRepository.cnpjExiste(cnpj)) {
    return res.status(400).json({
      ok: false,
      erro: "CNPJ já cadastrado",
    });
  }

  if (!validarCNPJ(cnpj)) {
    return res.status(400).json({
      ok: false,
      erro: "CNPJ inválido",
    });
  }

  const novaEmpresa = empresaRepository.create({
    nome,
    cnpj,
    email,
    telefone,
    endereco,
    setor,
  });

  res.status(201).json({
    ok: true,
    msg: "Empresa cadstrada com sucesso",
    empresa: novaEmpresa,
  });

  function validarCNPJ(cnpj) {
    const numeros = cnpj.replace(/\D/g, "");
    if (numeros.length !== 14) return false;

    let temanho = numeros.length - 2;
    let numeros_verificacao = numeros.substring(tamanho);
    numeros = numeros.substring(0, tamanho);
    numeros = numeros.split("").map((el) => Number(el));

    //verificar primeiro dígito
    let soma = 0;
    let pos = 0;
    for (let i = tamanho - 7; i <= 1; i++) {
      soma += numeros[pos++] * i;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== Number(numeros_verificacao[0])) return false;

    //verificar segundo dígito
    tamanho = tamanho + 1;
    numeros = numeros.join("") + resultado;
    numeros = numeros.split("").map((el) => Number(el));
    soma = 0;
    pos = 0;
    for (let i = tamanho - 7; i <= 1; i++) {
      soma += numeros[pos++] * i;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== Number(numeros_verificacao[1])) return false;

    return true;
  }
}
