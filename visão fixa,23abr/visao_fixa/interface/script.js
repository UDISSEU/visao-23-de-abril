if (localStorage.getItem("logado") !== "true") {
  window.location.href = "../login/login.html";
}

const usuarioNome = localStorage.getItem("usuarioAtualNome");
const usuarioEmail = localStorage.getItem("usuarioAtualEmail");
const savedTheme = localStorage.getItem("theme") || "light";

function applyTheme(theme) {
  document.body.classList.toggle("dark-mode", theme === "dark");
  localStorage.setItem("theme", theme);

  const themeLabel = document.querySelector(".theme-label span");
  const themeIcon = document.getElementById("theme-icon");

  if (themeLabel) {
    themeLabel.innerText = theme === "dark" ? "Tema Claro" : "Tema Escuro";
  }

  if (themeIcon) {
    themeIcon.innerText = theme === "dark" ? "☀️" : "🌙";
  }
}

function toggleTheme() {
  const currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
  applyTheme(currentTheme === "dark" ? "light" : "dark");
}

function showWelcomeAnimation() {
  if (localStorage.getItem("showWelcome") !== "true") return;
  if (!usuarioEmail) return;

  const welcomeOverlay = document.getElementById("welcome-overlay");
  const welcomeName = document.getElementById("welcome-name");

  if (!welcomeOverlay || !welcomeName) return;

  welcomeName.innerText = usuarioNome || "Usuário";
  welcomeOverlay.classList.add("active");
  localStorage.removeItem("showWelcome");

  setTimeout(() => {
    welcomeOverlay.classList.add("fade-out");
    const welcomeCard = welcomeOverlay.querySelector(".welcome-card");

    if (welcomeCard) {
      welcomeCard.classList.add("fade-out");
    }

    setTimeout(() => {
      welcomeOverlay.style.display = "none";
    }, 280);
  }, 1600);
}

function initProfileMenu() {
  const profileButton = document.getElementById("profile-button");
  const profileMenu = document.getElementById("profile-menu");
  const profileDot = document.getElementById("profile-dot");
  const profileName = document.getElementById("profile-user-name");
  const profileEmail = document.getElementById("profile-user-email");
  const themeToggle = document.getElementById("theme-toggle");
  const logoutButton = document.getElementById("logout-button");

  if (profileDot && usuarioNome) {
    profileDot.innerText = usuarioNome.charAt(0).toUpperCase();
  }

  if (profileName) {
    profileName.innerText = usuarioNome || "Usuário";
  }

  if (profileEmail) {
    profileEmail.innerText = usuarioEmail || "";
  }

  if (profileButton && profileMenu) {
    profileButton.addEventListener("click", function (event) {
      event.stopPropagation();
      profileMenu.classList.toggle("active");
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      toggleTheme();
      profileMenu.classList.remove("active");
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      localStorage.removeItem("logado");
      localStorage.removeItem("usuarioAtualNome");
      localStorage.removeItem("usuarioAtualEmail");
      window.location.href = "../login/login.html";
    });
  }

  document.addEventListener("click", function (event) {
    if (!profileMenu || !profileMenu.classList.contains("active")) return;
    if (!event.target.closest("#profile-button") && !event.target.closest("#profile-menu")) {
      profileMenu.classList.remove("active");
    }
  });
}

function initNomeInput() {
  const nomeInput = document.getElementById("nome");
  if (nomeInput) {
    nomeInput.addEventListener("input", function() {
      const value = nomeInput.value;
      if (value.length === 1 && value.match(/[a-z]/)) {
        nomeInput.value = value.toUpperCase();
      }
    });
  }
}

function initScrollDrag() {
  const container = document.getElementById('categorias-container');
  if (!container) return;

  let isDragging = false;
  let startX;
  let scrollLeft;

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    container.style.cursor = 'grabbing';
  });

  container.addEventListener('mouseleave', () => {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  container.addEventListener('mouseup', () => {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2; // velocidade do scroll
    container.scrollLeft = scrollLeft - walk;
  });
}

window.addEventListener("DOMContentLoaded", () => {
  applyTheme(savedTheme);
  showWelcomeAnimation();
  initProfileMenu();
  initNomeInput();
  initScrollDrag();
  initViewSwitcher();
  showView('gastos');
  atualizarSalario();
});

// garante que tem usuário
if (!usuarioEmail) {
  window.location.href = "../login/login.html";
}

// valores em CENTAVOS
let dados = JSON.parse(localStorage.getItem("dados_" + usuarioEmail)) || {
  salario: 0,
  totais: {
    "Alimentação": 0,
    "Moradia": 0,
    "Contas Bancárias": 0,
    "Transporte": 0,
    "Saúde": 0,
    "Educação": 0,
    "Telefonia": 0,
    "Lazer e Entretenimento": 0,
    "Vestuário": 0,
    "Imposto e Taxas": 0
  },
  gastos: {
    "Alimentação": [],
    "Moradia": [],
    "Contas Bancárias": [],
    "Transporte": [],
    "Saúde": [],
    "Educação": [],
    "Telefonia": [],
    "Lazer e Entretenimento": [],
    "Vestuário": [],
    "Imposto e Taxas": []
  }
};

let totais = dados.totais;

function adicionarGasto() {
  const nome = document.getElementById("nome").value.trim();
  const valorInput = document.getElementById("valor").value.trim();
  const categoria = document.getElementById("categoria").value;

  if (!nome || !valorInput) {
    alert("Preencha todos os campos!");
    return;
  }

  // 🔥 converte para centavos corretamente
  const valor = Math.round(
    Number(valorInput.replace(",", ".")) * 100
  );

  if (isNaN(valor) || valor <= 0) {
    alert("Digite um valor válido!");
    return;
  }

  // Adicionar à lista de gastos
  dados.gastos[categoria].push({ nome: nome, valor: valor });

  // Recalcular total
  dados.totais[categoria] = dados.gastos[categoria].reduce((sum, gasto) => sum + gasto.valor, 0);

  salvar();
  atualizarTela();

  // limpar campos
  document.getElementById("nome").value = "";
  document.getElementById("valor").value = "";
}

// 💰 FORMATO BRASILEIRO CORRETO
function formatar(valor) {
  return (valor / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function initViewSwitcher() {
  const btnGastos = document.getElementById('btn-gastos');
  const btnSalario = document.getElementById('btn-salario');

  if (btnGastos) {
    btnGastos.addEventListener('click', () => showView('gastos'));
  }

  if (btnSalario) {
    btnSalario.addEventListener('click', () => showView('salario'));
  }
}

function showView(view) {
  const gastosSection = document.querySelector('.formulario');
  const categoriasSection = document.getElementById('categorias-container');
  const cardTotal = document.querySelector('.card-total');
  const salarioArea = document.getElementById('salario-area');
  const btnGastos = document.getElementById('btn-gastos');
  const btnSalario = document.getElementById('btn-salario');

  if (!gastosSection || !categoriasSection || !salarioArea || !btnGastos || !btnSalario) return;

  const isSalario = view === 'salario';
  gastosSection.hidden = isSalario;
  categoriasSection.hidden = isSalario;
  salarioArea.hidden = !isSalario;
  if (cardTotal) cardTotal.hidden = isSalario;
  document.body.classList.toggle('salary-view', isSalario);

  btnGastos.classList.toggle('active', !isSalario);
  btnSalario.classList.toggle('active', isSalario);
}

function salvarSalario() {
  const salarioInput = document.getElementById('salario-input');
  if (!salarioInput) return;

  const valor = Math.round(Number(salarioInput.value.replace(',', '.')) * 100);
  if (isNaN(valor) || valor < 0) {
    alert('Digite um valor de salário válido!');
    return;
  }

  dados.salario = valor;
  salvar();
  atualizarSalario();
  salarioInput.value = '';
}

function atualizarSalario() {
  const salarioAtual = document.getElementById('salario-atual');
  const rendaAtual = document.getElementById('renda-atual');
  const saidaAtual = document.getElementById('saida-atual');
  const saldoAtual = document.getElementById('saldo-atual');
  const saldoCard = document.querySelector('.salary-card-saldo');

  const totalSaida = Object.values(totais).reduce((sum, valor) => sum + valor, 0);
  const saldo = (dados.salario || 0) - totalSaida;
  const valorSalario = formatar(dados.salario || 0);
  const valorSaida = formatar(totalSaida);
  const valorSaldo = formatar(saldo);

  if (salarioAtual) {
    salarioAtual.innerText = valorSalario;
  }
  if (rendaAtual) {
    rendaAtual.innerText = valorSalario;
  }
  if (saidaAtual) {
    saidaAtual.innerText = valorSaida;
  }
  if (saldoAtual) {
    saldoAtual.innerText = valorSaldo;
  }
  
  if (saldoCard) {
    if (saldo < 0) {
      saldoCard.classList.add('negativo');
    } else {
      saldoCard.classList.remove('negativo');
    }
  }
}

function atualizarTela() {
  document.getElementById("alimentacao-total").innerText =
    formatar(totais["Alimentação"]);

  document.getElementById("moradia-total").innerText =
    formatar(totais["Moradia"]);

  document.getElementById("contas-total").innerText =
    formatar(totais["Contas Bancárias"]);

  document.getElementById("transporte-total").innerText =
    formatar(totais["Transporte"]);

  document.getElementById("saude-total").innerText =
    formatar(totais["Saúde"]);

  document.getElementById("educacao-total").innerText =
    formatar(totais["Educação"]);

  document.getElementById("telefonia-total").innerText =
    formatar(totais["Telefonia"]);

  document.getElementById("lazer-total").innerText =
    formatar(totais["Lazer e Entretenimento"]);

  document.getElementById("vestuario-total").innerText =
    formatar(totais["Vestuário"]);

  document.getElementById("imposto-total").innerText =
    formatar(totais["Imposto e Taxas"]);

  let total =
    totais["Alimentação"] +
    totais["Moradia"] +
    totais["Contas Bancárias"] +
    totais["Transporte"] +
    totais["Saúde"] +
    totais["Educação"] +
    totais["Telefonia"] +
    totais["Lazer e Entretenimento"] +
    totais["Vestuário"] +
    totais["Imposto e Taxas"];

  document.getElementById("total-geral").innerText =
    formatar(total);

  document.getElementById("alimentacao-msg").innerText =
    totais["Alimentação"] === 0 ? "Nenhum gasto ainda" : "Gastos registrados";

  document.getElementById("moradia-msg").innerText =
    totais["Moradia"] === 0 ? "Nenhum gasto ainda" : "Gastos registrados";

  document.getElementById("contas-msg").innerText =
    totais["Contas Bancárias"] === 0 ? "Nenhum gasto ainda" : "Gastos registrados";

  document.getElementById("transporte-msg").innerText =
    totais["Transporte"] === 0 ? "Nenhum gasto ainda" : "Gastos registrados";

  document.getElementById("saude-msg").innerText =
    totais["Saúde"] === 0 ? "Nenhum gasto ainda" : "Gastos registrados";

  document.getElementById("educacao-msg").innerText =
    totais["Educação"] === 0 ? "Nenhum gasto ainda" : "Gastos registrados";

  document.getElementById("telefonia-msg").innerText =
    totais["Telefonia"] === 0 ? "Nenhum gasto ainda" : "Gastos registrados";

  document.getElementById("lazer-msg").innerText =
    totais["Lazer e Entretenimento"] === 0 ? "Nenhum gasto ainda" : "Gastos registrados";

  document.getElementById("vestuario-msg").innerText =
    totais["Vestuário"] === 0 ? "Nenhum gasto ainda" : "Gastos registrados";

  document.getElementById("imposto-msg").innerText =
    totais["Imposto e Taxas"] === 0 ? "Nenhum gasto ainda" : "Gastos registrados";

  // Atualizar listas de gastos
  atualizarListasGastos();
  atualizarSalario();
}

function atualizarListasGastos() {
  const categorias = [
    { key: "Alimentação", id: "alimentacao-lista" },
    { key: "Moradia", id: "moradia-lista" },
    { key: "Contas Bancárias", id: "contas-lista" },
    { key: "Transporte", id: "transporte-lista" },
    { key: "Saúde", id: "saude-lista" },
    { key: "Educação", id: "educacao-lista" },
    { key: "Telefonia", id: "telefonia-lista" },
    { key: "Lazer e Entretenimento", id: "lazer-lista" },
    { key: "Vestuário", id: "vestuario-lista" },
    { key: "Imposto e Taxas", id: "imposto-lista" }
  ];

  categorias.forEach(cat => {
    const listaElement = document.getElementById(cat.id);
    const gastos = dados.gastos[cat.key];

    // Ordenar por preço (valor em centavos)
    gastos.sort((a, b) => b.valor - a.valor);

    listaElement.innerHTML = gastos.map(gasto => `
      <div class="gasto-item">
        <span class="gasto-nome">${gasto.nome}</span>
        <span class="gasto-valor">${formatar(gasto.valor)}</span>
      </div>
    `).join('');
  });
}

function salvar() {
  localStorage.setItem("dados_" + usuarioEmail, JSON.stringify(dados));
}

// carregar ao abrir
atualizarTela();