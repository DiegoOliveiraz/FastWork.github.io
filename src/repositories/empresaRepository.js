import empresas from '../database/empresas.json' with { type: 'json'};
import fs from 'fs';
import path from 'path';

const empresaRepository = {
    readAll(){
        return empresas;
    },

    emailExiste(email) {
        return empresas.some( e => e.email.toLowerCase() === email.toLowerCase());
    },
    cnpjExiste(cnpj) {
        return empresas.some( e => e.cnpj === cnpj)
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
    salvarEmArquivo() {
        const caminhoDb = path.join(process.cwd(), 'src', 'database', 'empresas.json');
        fs.writeFileSync(caminhoDb, JSON.stringify(empresas, null, 2));
    }
};

export default empresaRepository;