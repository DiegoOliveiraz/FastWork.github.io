const SESSION_KEY = "fastwork_session";

function tipoSelecionado() {
  return document.getElementById("tipoEmpresa").checked ? "empresa" : "profissional";
}

function mostrarAlerta(tipo, msg) {
  const id = tipo === "sucesso" ? "alertaSucesso" : "alertaErro";
  const outroId = tipo === "sucesso" ? "alertaErro" : "alertaSucesso";
  document.getElementById(outroId).classList.add("d-none");
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove("d-none");
}

function exibirPerfil(usuario, tipo) {
  document.getElementById("cardLogin").classList.add("d-none");
  document.getElementById("cardPerfil").classList.remove("d-none");

  const nomeExibido = usuario.nm_usuario || "";
  document.getElementById("avatarPerfil").textContent = nomeExibido.charAt(0).toUpperCase();
  document.getElementById("nomePerfil").textContent = nomeExibido;
  document.getElementById("tipoPerfil").textContent = tipo === "empresa" ? "Empresa" : "Profissional";

  const item = document.createElement("li");
  item.className = "list-group-item bg-black text-light border-primary d-flex justify-content-between";
  const rotulo = document.createElement("span");
  rotulo.className = "text-white-50";
  rotulo.textContent = "E-mail";
  const valor = document.createElement("span");
  valor.textContent = usuario.ds_email || "";
  item.append(rotulo, valor);
  document.getElementById("infoPerfil").replaceChildren(item);
}

function sair() {
  localStorage.removeItem(SESSION_KEY);
  document.getElementById("cardPerfil").classList.add("d-none");
  document.getElementById("cardLogin").classList.remove("d-none");
}

document.querySelectorAll('input[name="tipo"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const link = document.getElementById("linkCadastro");
    if (tipoSelecionado() === "empresa") {
      link.href = "cadastroem.html";
      link.textContent = "Cadastre-se como Empresa";
    } else {
      link.href = "formu.html";
      link.textContent = "Cadastre-se como Profissional";
    }
  });
});

const sessao = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
if (sessao) exibirPerfil(sessao.usuario, sessao.tipo);

document.getElementById("btnSair").addEventListener("click", sair);

document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  const form = e.target;

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const ds_email = document.getElementById("email").value.trim();
  const ds_senha = document.getElementById("senha").value;
  const tipo = tipoSelecionado();
  const endpoint = tipo === "empresa" ? "/api/login/empresa" : "/api/login";

  const btn = document.getElementById("btnEntrar");
  btn.disabled = true;

  try {
    const resposta = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ds_email, ds_senha }),
    });
    const data = await resposta.json();

    if (!resposta.ok || !data.ok) {
      mostrarAlerta("erro", data.erro || "E-mail ou senha incorretos.");
      return;
    }

    const usuario = data.usuario || data.empresa;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token: data.token, usuario, tipo }));
    mostrarAlerta("sucesso", "Login realizado com sucesso!");
    setTimeout(() => exibirPerfil(usuario, tipo), 400);
  } catch {
    mostrarAlerta("erro", "Não foi possível conectar ao servidor. Tente novamente.");
  } finally {
    btn.disabled = false;
  }
});
