const API_URL = "https://cars-api-ur5t.onrender.com/api/auth";

const authModal = document.getElementById('authModal');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toRegister = document.getElementById('toRegister');
const toLogin = document.getElementById('toLogin');
const userControls = document.getElementById('userControls');
const cabinetContent = document.getElementById('cabinetContent');

// ===== Переключение форм =====
toRegister.addEventListener('click', () => {
  loginModal.style.display = 'none';
  registerModal.style.display = 'block';
});
toLogin.addEventListener('click', () => {
  registerModal.style.display = 'none';
  loginModal.style.display = 'block';
});

// ===== Проверка токена =====
const token = localStorage.getItem('authToken');
if (!token) {
  openAuthModal();
} else {
  showCabinet();
}

function openAuthModal() {
  document.body.classList.add('modal-open');
  authModal.classList.add('active');
}

function closeAuthModal() {
  document.body.classList.remove('modal-open');
  authModal.classList.remove('active');
}

// ===== Вход =====
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    username: loginForm.username.value,
    password: loginForm.password.value
  };
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();
    localStorage.setItem('authToken', result.token);
    closeAuthModal();
    showCabinet();
  } catch (err) {
    alert(err.message);
  }
});

// ===== Регистрация =====
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    username: registerForm.username.value,
    email: registerForm.email.value,
    password: registerForm.password.value
  };
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();
    localStorage.setItem('authToken', result.token);
    closeAuthModal();
    showCabinet();
  } catch (err) {
    alert(err.message);
  }
});

// ===== Выход =====
function logout() {
  localStorage.removeItem('authToken');
  alert("Вы вышли из аккаунта");
  location.reload();
}

// ===== Отображение личного кабинета =====
function showCabinet() {
  cabinetContent.innerHTML = `
    <h3>Добро пожаловать в систему!</h3>
    <p>Здесь будет личный контент пользователя.</p>
  `;
  userControls.innerHTML = `
    <button class="button small-btn" onclick="logout()">Выйти</button>
  `;
}
