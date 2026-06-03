import empresas from '../database/empresas.json' with { type: 'json'};
import fs from 'fs';
import path from 'path';

const empresaRepository = {
    readAll() {
        return empresas.filter(e => e.ativo);
    },

    readById(id) {
        return empresas.find(e => e.id === id && e.ativo);
    },

    emailExiste(email) {
        return empresas.some(e => e.email.toLowerCase() === email.toLowerCase() && e.ativo);
    },

    cnpjExiste(cnpj) {
        return empresas.some(e => e.cnpj === cnpj && e.ativo);
    },

    buscaPorEmail(email) {
        return empresas.find(e => e.email.toLowerCase() === email.toLowerCase());
    },

    create(empresa) {
        const novaEmpresa = {
            id: `emp_${Date.now()}`,
            ...empresa,
            dataCadastro: new Date().toISOString(),
            ativo: true
        };
        empresas.push(novaEmpresa);
        this.salvarEmArquivo();
        return novaEmpresa;
    },

    update(id, dados) {
        const indice = empresas.findIndex(e => e.id === id);
        if (indice === -1) return null;
        empresas[indice] = { ...empresas[indice], ...dados };
        this.salvarEmArquivo();
        const { senha, ...dadosSemSenha } = empresas[indice];
        return dadosSemSenha;
    },

    deactivate(id) {
        const indice = empresas.findIndex(e => e.id === id);
        if (indice === -1) return false;
        empresas[indice].ativo = false;
        this.salvarEmArquivo();
        return true;
    },

    salvarEmArquivo() {
        const caminhoDb = path.join(process.cwd(), 'src', 'database', 'empresas.json');
        fs.writeFileSync(caminhoDb, JSON.stringify(empresas, null, 2));
    }
};

export default empresaRepository;