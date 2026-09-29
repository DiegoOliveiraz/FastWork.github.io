const apiService = {
  async buscarCEP(cep) {
    const cepLimpo = String(cep).replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return { success: false, message: "Digite um CEP válido com 8 números." };
    }

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );
      if (!resposta.ok) {
        throw new Error("Falha na consulta do ViaCEP");
      }

      const data = await resposta.json();
      if (data.erro) {
        return { success: false, message: "CEP não encontrado." };
      }

      return { success: true, data };
    } catch {
      return {
        success: false,
        message: "Não foi possível consultar o ViaCEP.",
      };
    }
  },

  async buscarUsuarioGitHub(username) {
    try {
      const resposta = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}`,
      );
      if (!resposta.ok) {
        return { success: false, message: "Usuário do GitHub não encontrado." };
      }
      return { success: true, data: await resposta.json() };
    } catch {
      return {
        success: false,
        message: "Não foi possível consultar o GitHub.",
      };
    }
  },

  async obterCitacaoMotivacional() {
    try {
      const resposta = await fetch("https://api.quotable.io/random");
      if (!resposta.ok) {
        throw new Error("Falha na consulta de citação");
      }
      return { success: true, data: await resposta.json() };
    } catch {
      return { success: false, message: "Não foi possível obter uma citação." };
    }
  },

  async buscarVagas() {
    return {
      success: true,
      data: [
        {
          titulo: "Pedreiro",
          empresa: "FastWork",
          localizacao: "Volta Redonda, RJ",
          salario: "A combinar",
        },
        {
          titulo: "Eletricista",
          empresa: "FastWork",
          localizacao: "Volta Redonda, RJ",
          salario: "A combinar",
        },
        {
          titulo: "Auxiliar de manutenção",
          empresa: "FastWork",
          localizacao: "Volta Redonda, RJ",
          salario: "A combinar",
        },
      ],
    };
  },
};

window.apiService = apiService;
