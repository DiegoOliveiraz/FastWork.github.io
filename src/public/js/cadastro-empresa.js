const campo = (id) => document.getElementById(id);
const alertaErro = campo("alertaErro");

campo("cnpj").addEventListener("input", (e) => {
  const d = e.target.value.replace(/\D/g, "").slice(0, 14);
  let out = d;
  if (d.length > 2) out = d.slice(0, 2) + "." + d.slice(2);
  if (d.length > 5) out = out.slice(0, 6) + "." + out.slice(6);
  if (d.length > 8) out = out.slice(0, 10) + "/" + out.slice(10);
  if (d.length > 12) out = out.slice(0, 15) + "-" + out.slice(15);
  e.target.value = out;
});

cadastroComum.mascararTelefone(campo("telefone"));
cadastroComum.mascararCep(campo("cep"));
cadastroComum.preencherEnderecoPorCep(campo("cep"), alertaErro, {
  logradouro: "endereco", cidade: "cidade", estado: "estado",
});

cadastroComum.configurarEnvio({
  form: campo("formEmpresa"),
  alertaErro,
  botao: campo("btnCadastrar"),
  endpoint: "/api/empresas",
  mensagemSucesso: "Empresa cadastrada com sucesso! Faça login para continuar.",
  montarDados: () => ({
    nm_usuario: campo("nome").value,
    ds_cnpj: campo("cnpj").value,
    ds_email: campo("email").value,
    ds_telefone: campo("telefone").value,
    ds_senha: campo("senha").value,
    ds_endereco: campo("endereco").value,
    ds_cep: campo("cep").value,
    ds_cidade: campo("cidade").value,
    ds_estado: campo("estado").value,
    ds_setor: campo("setor").value,
  }),
});
