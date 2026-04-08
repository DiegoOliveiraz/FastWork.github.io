import usuarioRepository from '../repositories/usuarioRepository.js';

export function cadastrarUsuario(req,res) {
    const { nome,email, cpf, telefone, endereco, cidade, uf, cep, profissao, experiencia, habilidades, disponibilidade} = req.body;

    //validação Básica
    if (!nome || !email || !cpf || !telefone) {
        return res.status(400).json({
            ok: false,
            erro: 'Campos obrigatórios não preenchidos'
        });
    }

    // verificando email unico
    if (usuarioRepository.emailExiste(email)) {
        return res.status(400).json({
            ok:false,
            erro: 'Email já cadastrado'
        });
    }
    //validar CPF (algoritimo)
    if (!validarCPF(cpf)) {
        return res.status(400).json({
            ok: false,
            erro: 'CPF inválido'
        });
    }
    //criar usuário
    const novoUsuario = usuarioRepository.create({
        nome,
        email,
        cpf,
        telefone,
        endereco,
        cidade,
        uf,
        cep,
        profissao,
        experiencia,
        habilidades,
        disponibilidade
    });

    res.status(201).json({
        ok: true,
        msg: 'Usuário cadasrado com sucesso',
        usuario: novoUsuario
    });
}

//validar CPF
function validarCpf(cpf) {
    const numeros = cpf.replace(/\D/g, '');
    if (numeros.length !== 11) return false;

    let soma = 0;
    let resto;
    for(let i =1; i<= 9; i++) {
        soma += parseInt(numeros.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.substring(9, 10))) return false;

    soma = 0
    for(let i = 1; i <= 10; i++) {
        soma += parseInt(numeros.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.substring(10, 11))) return false;

    return true;
}