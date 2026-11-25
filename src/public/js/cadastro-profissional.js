const campo = (id) => document.getElementById(id);
const alertaErro = campo("alertaErro");

cadastroComum.mascararTelefone(campo("telefone"));
cadastroComum.mascararCep(campo("cep"));
cadastroComum.preencherEnderecoPorCep(campo("cep"), alertaErro, {
  logradouro: "logradouro", cidade: "cidade", estado: "estado",
});

cadastroComum.configurarEnvio({
  form: campo("formProfissional"),
  alertaErro,
  botao: campo("btnCadastrar"),
  endpoint: "/api/usuarios",
  mensagemSucesso: "Cadastro realizado com sucesso! Faça login para continuar.",
  montarDados: () => ({
    nm_usuario: campo("nome").value,
    ds_email: campo("email").value,
    ds_senha: campo("senha").value,
    ds_telefone: campo("telefone").value,
    ds_cep: campo("cep").value,
    ds_logradouro: campo("logradouro").value,
    ds_cidade: campo("cidade").value,
    ds_estado: campo("estado").value,
    ds_profissao: campo("profissao").value,
    nr_experiencia: Number.parseInt(campo("experiencia").value, 10) || 0,
    ds_habilidades: campo("habilidades").value,
    st_aceite_termos: campo("termos").checked,
  }),
});
