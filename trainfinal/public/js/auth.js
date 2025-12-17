const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginEmailError = document.getElementById("loginEmailError");
const loginPasswordError = document.getElementById("loginPasswordError");
const loginError = document.getElementById("loginError");

const regName = document.getElementById("regName");
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const regNameError = document.getElementById("regNameError");
const regEmailError = document.getElementById("regEmailError");
const regPasswordError = document.getElementById("regPasswordError");
const registerError = document.getElementById("registerError");

const demoBtn = document.getElementById("demoBtn");

// Toggle tabs
tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  loginForm.style.display = "block";
  registerForm.style.display = "none";
  clearErrors();
});

tabRegister.addEventListener("click", () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  loginForm.style.display = "none";
  registerForm.style.display = "block";
  clearErrors();
});

function clearErrors() {
  [
    loginEmailError,
    loginPasswordError,
    loginError,
    regNameError,
    regEmailError,
    regPasswordError,
    registerError,
  ].forEach((el) => (el.textContent = ""));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Auto redirect if already logged in
(function () {
  const token = getToken();
  const user = localStorage.getItem("user");
  if (token && user) {
    window.location.href = "/dashboard.html";
  }
})();

// Demo credentials (just fills fields)
demoBtn.addEventListener("click", () => {
  loginEmail.value = "demo@example.com";
  loginPassword.value = "password";
});

// Handle login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  let valid = true;

  if (!isValidEmail(email)) {
    loginEmailError.textContent = "Please enter a valid email address.";
    valid = false;
  }
  if (!password) {
    loginPasswordError.textContent = "Password is required.";
    valid = false;
  }

  if (!valid) return;

  try {
    const res = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuth(res.token, res.user);
    window.location.href = "/dashboard.html";
  } catch (err) {
    loginError.textContent = err.message;
  }
});

// Handle register
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const name = regName.value.trim();
  const email = regEmail.value.trim();
  const password = regPassword.value;

  let valid = true;

  if (!name) {
    regNameError.textContent = "Name is required.";
    valid = false;
  }

  if (!isValidEmail(email)) {
    regEmailError.textContent = "Enter a valid email.";
    valid = false;
  }

  if (!password || password.length < 6) {
    regPasswordError.textContent = "Minimum 6 characters.";
    valid = false;
  }

  if (!valid) return;

  try {
    const res = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setAuth(res.token, res.user);
    window.location.href = "/dashboard.html";
  } catch (err) {
    registerError.textContent = err.message;
  }
});
