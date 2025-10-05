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

// === Переключение форм ===
toRegister.onclick = () => {
  loginModal.style.display = 'none';
  registerModal.style.display = 'block';
};
toLogin.onclick = () => {
  registerModal.style.display = 'none';
  loginModal.style.display = 'block';
};

// === Проверка токена ===
const token = localStorage.getItem('authToken');
if (!token) openAuthModal(); else showCabinet();

function openAuthModal() {
  document.body.classList.add('modal-open');
  authModal.classList.add('active');
}
function closeAuthModal() {
  document.body.classList.remove('modal-open');
  authModal.classList.remove('active');
}

// === Кнопки блокировки ===
function disableButton(btn, time = 1500) {
  btn.disabled = true;
  btn.style.opacity = "0.6";
  setTimeout(() => {
    btn.disabled = false;
    btn.style.opacity = "1";
  }, time);
}

// === Показ / скрытие пароля ===
document.querySelectorAll('.toggle-password').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const input = toggle.previousElementSibling;
    input.type = input.type === 'password' ? 'text' : 'password';
    toggle.textContent = input.type === 'password' ? '👁️' : '🙈';
  });
});

// === Вход ===
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = loginForm.querySelector('button');
  disableButton(btn);
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

// === Регистрация ===
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = registerForm.querySelector('button');
  disableButton(btn);
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

// === Смена пароля ===
async function changePassword() {
  const oldPassword = prompt("Введите старый пароль:");
  const newPassword = prompt("Введите новый пароль (не короче 6 символов):");
  if (!oldPassword || !newPassword) return;
  if (newPassword.length < 6) return alert("Слишком короткий пароль");

  try {
    const res = await fetch(`${API_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    if (!res.ok) throw new Error(await res.text());
    alert("Пароль успешно изменён");
  } catch (err) {
    alert("Ошибка: " + err.message);
  }
}

// === Выход ===
function logout() {
  localStorage.removeItem('authToken');
  location.reload();
}

// === Отображение личного кабинета ===
function showCabinet() {
  cabinetContent.innerHTML = `
    <h3>Ваши объявления</h3>
    <div id="myAds" class="ads-container"></div>
    <button id="addAd" class="button small-btn">Добавить объявление</button>
  `;
  userControls.innerHTML = `
    <button class="button small-btn" onclick="changePassword()">Сменить пароль</button>
    <button class="button small-btn" onclick="logout()">Выйти</button>
  `;
  loadUserAds();
}
function updateProfileMenu() {
  const token = localStorage.getItem('authToken');
  const profileDropdown = document.getElementById('profileDropdown');
  if (token) {
    profileDropdown.innerHTML = `
      <a href="cabinet.html">Профиль</a>
      <a href="#" onclick="changePassword()">Сменить пароль</a>
      <a href="#" onclick="logout()">Выйти</a>
      <a href="#" class="danger" onclick="deleteAccount()">Удалить аккаунт</a>
    `;
  } else {
    profileDropdown.innerHTML = `
      <a href="#" onclick="openAuthModal()">Войти</a>
      <a href="#" onclick="openAuthModal()">Регистрация</a>
    `;
  }
}


// === Загрузка объявлений ===
async function loadUserAds() {
  const adsContainer = document.getElementById('myAds');
  adsContainer.innerHTML = "<p>Загрузка...</p>";
  try {
    const res = await fetch(`https://cars-api-ur5t.onrender.com/api/cars/my`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    });
    if (!res.ok) throw new Error("Ошибка загрузки объявлений");
    const cars = await res.json();
    adsContainer.innerHTML = cars.length
      ? cars.map(c => `
          <div class="ad-card">
            <h4>${c.brand} ${c.model} (${c.year})</h4>
            <p>${c.price} ₽</p>
            <button onclick="editAd(${c.id})">Редактировать</button>
            <button onclick="deleteAd(${c.id})">Удалить</button>
          </div>`).join('')
      : "<p>Пока нет объявлений</p>";
  } catch (e) {
    adsContainer.innerHTML = `<p>Ошибка: ${e.message}</p>`;
  }
}
