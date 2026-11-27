// Lógica compartilhada pelos cadastros de profissional (formu.html) e empresa (cadastroem.html):
// máscaras de campo, busca de endereço por CEP e envio do formulário para a API.
const cadastroComum = {
  mascararTelefone(campo) {
    campo.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "").slice(0, 11);
      if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
      e.target.value = v;
    });
  },

  mascararCep(campo) {
    campo.addEventListener("input", (e) => {
      const numeros = e.target.value.replace(/\D/g, "").slice(0, 8);
      e.target.value = numeros.length > 5 ? `${numeros.slice(0, 5)}-${numeros.slice(5)}` : numeros;
    });
  },

  // Ao sair do campo CEP, consulta o ViaCEP e preenche rua, cidade e estado.
  // ids = { logradouro: "endereco" | "logradouro", cidade: "...", estado: "..." }
  preencherEnderecoPorCep(campoCep, alertaErro, ids) {
    campoCep.addEventListener("blur", async (e) => {
      const resultado = await window.apiService.buscarCEP(e.target.value);
      if (!resultado.success) {
        cadastroComum.mostrarErro(alertaErro, resultado.message);
        return;
      }
      alertaErro.classList.add("d-none");
      document.getElementById(ids.logradouro).value = resultado.data.logradouro || "";
      document.getElementById(ids.cidade).value = resultado.data.localidade || "";
      document.getElementById(ids.estado).value = resultado.data.uf || "";
    });
  },

  mostrarErro(alertaErro, mensagem) {
    alertaErro.textContent = mensagem;
    alertaErro.classList.remove("d-none");
  },

  // Valida o formulário e envia os dados. montarDados() devolve o JSON do POST.
  configurarEnvio({ form, alertaErro, botao, endpoint, montarDados, mensagemSucesso }) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      alertaErro.classList.add("d-none");

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }

      botao.disabled = true;
      try {
        const resposta = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(montarDados()),
        });
        const data = await resposta.json();

        if (!resposta.ok || !data.ok) {
          cadastroComum.mostrarErro(alertaErro, data.erro || "Erro ao cadastrar. Tente novamente.");
          return;
        }

        alert(mensagemSucesso);
        window.location.href = "login.html";
      } catch {
        cadastroComum.mostrarErro(alertaErro, "Não foi possível conectar ao servidor. Tente novamente.");
      } finally {
        botao.disabled = false;
      }
    });
  },
};

window.cadastroComum = cadastroComum;
