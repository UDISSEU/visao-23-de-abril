function mostrarCadastro() {
  document.getElementById("login").style.display = "none";
  document.getElementById("cadastro").style.display = "block";
}

function voltarLogin() {
  document.getElementById("login").style.display = "block";
  document.getElementById("cadastro").style.display = "none";
}

// � VERIFICAR SENHA EM TEMPO REAL
function verificarSenha() {
  const senha = document.getElementById("cad-pass").value;
  const requisitos = document.getElementById("requisitos");

  // Mostrar requisitos se digitou algo
  if (senha.length > 0) {
    requisitos.style.display = "block";
  } else {
    requisitos.style.display = "none";
  }

  // Verificar cada requisito
  const req8 = document.getElementById("req-8");
  if (senha.length >= 8) {
    req8.classList.add("atendido");
    req8.classList.remove("nao-atendido");
  } else {
    req8.classList.remove("atendido");
    req8.classList.add("nao-atendido");
  }

  const reqMaiuscula = document.getElementById("req-maiuscula");
  if (/[A-Z]/.test(senha)) {
    reqMaiuscula.classList.add("atendido");
    reqMaiuscula.classList.remove("nao-atendido");
  } else {
    reqMaiuscula.classList.remove("atendido");
    reqMaiuscula.classList.add("nao-atendido");
  }

  const reqMinuscula = document.getElementById("req-minuscula");
  if (/[a-z]/.test(senha)) {
    reqMinuscula.classList.add("atendido");
    reqMinuscula.classList.remove("nao-atendido");
  } else {
    reqMinuscula.classList.remove("atendido");
    reqMinuscula.classList.add("nao-atendido");
  }

  const reqNumero = document.getElementById("req-numero");
  if (/[0-9]/.test(senha)) {
    reqNumero.classList.add("atendido");
    reqNumero.classList.remove("nao-atendido");
  } else {
    reqNumero.classList.remove("atendido");
    reqNumero.classList.add("nao-atendido");
  }

  const reqEspecial = document.getElementById("req-especial");
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) {
    reqEspecial.classList.add("atendido");
    reqEspecial.classList.remove("nao-atendido");
  } else {
    reqEspecial.classList.remove("atendido");
    reqEspecial.classList.add("nao-atendido");
  }
}

// �🔒 VALIDAR SENHA FORTE
function validarSenhaForte(senha) {
  // Mínimo 8 caracteres
  if (senha.length < 8) {
    return {
      valida: false,
      mensagem: "A senha deve ter pelo menos 8 caracteres!"
    };
  }

  // Verificar se tem letra maiúscula
  if (!/[A-Z]/.test(senha)) {
    return {
      valida: false,
      mensagem: "A senha deve conter pelo menos uma letra MAIÚSCULA!"
    };
  }

  // Verificar se tem letra minúscula
  if (!/[a-z]/.test(senha)) {
    return {
      valida: false,
      mensagem: "A senha deve conter pelo menos uma letra minúscula!"
    };
  }

  // Verificar se tem número
  if (!/[0-9]/.test(senha)) {
    return {
      valida: false,
      mensagem: "A senha deve conter pelo menos um número!"
    };
  }

  // Verificar se tem caractere especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) {
    return {
      valida: false,
      mensagem: "A senha deve conter pelo menos um caractere especial (!@#$%^&* etc)!"
    };
  }

  return { valida: true, mensagem: "Senha forte!" };
}

// 🧾 CADASTRAR
function cadastrar() {
  const nome = document.getElementById("cad-nome").value;
  const email = document.getElementById("cad-email").value;
  const pass = document.getElementById("cad-pass").value;
  const pass2 = document.getElementById("cad-pass2").value;

  if (!nome || !email || !pass || !pass2) {
    alert("Preencha todos os campos!");
    return;
  }

  // Validar senha forte
  const validacao = validarSenhaForte(pass);
  if (!validacao.valida) {
    alert(validacao.mensagem);
    return;
  }

  if (pass !== pass2) {
    alert("As senhas não coincidem!");
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  let existe = usuarios.find(u => u.email === email);

  if (existe) {
    alert("Email já cadastrado!");
    return;
  }

  usuarios.push({ nome, email, pass });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  alert("Conta criada com sucesso!");
  voltarLogin();
}

// 🔐 LOGIN
function login() {
  const email = document.getElementById("login-user").value;
  const pass = document.getElementById("login-pass").value;

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  let encontrado = usuarios.find(u => u.email === email && u.pass === pass);

  if (!encontrado) {
    alert("Login inválido!");
    return;
  }

  localStorage.setItem("logado", "true");
  localStorage.setItem("usuarioAtualNome", encontrado.nome);
  localStorage.setItem("usuarioAtualEmail", encontrado.email);
  localStorage.setItem("showWelcome", "true");

  window.location.href = "../interface/index.html";
}