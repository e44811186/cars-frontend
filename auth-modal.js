// === API URL ===
const API_URL = "https://cars-api-ur5t.onrender.com/api/auth";

// === Элементы ===
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
if (toRegister) {
  toRegister.onclick = () => {
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
  };
}
if (toLogin) {
  toLogin.onclick = () => {
    registerModal.style.display = 'none';
    loginModal.style.display = 'block';
  };
}

// === Проверка токена ===
const token = localStorage.getItem('authToken');
if (!token) {
  openAuthModal();
} else {
  showCabinet();
  updateProfileMenu();
}

// === Открыть / закрыть модалку ===
function openAuthModal() {
  if (!authModal) return;
  document.body.classList.add('modal-open');
  authModal.classList.add('active');
}
function closeAuthModal() {
  if (!authModal) return;
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
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button');
    disableButton(btn);

    const data = {
      username: loginForm.username.value.trim(),
      password: loginForm.password.value.trim()
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
      updateProfileMenu();
    } catch (err) {
      alert(err.message);
    }
  });
}

// === Регистрация ===
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector('button');
    disableButton(btn);

    const data = {
      username: registerForm.username.value.trim(),
      email: registerForm.email.value.trim(),
      password: registerForm.password.value.trim()
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
      updateProfileMenu();
    } catch (err) {
      alert(err.message);
    }
  });
}

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

// === Удаление аккаунта ===
async function deleteAccount() {
  if (!confirm("Удалить аккаунт безвозвратно?")) return;

  try {
    const res = await fetch(`${API_URL}/delete`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    });

    if (res.ok) {
      localStorage.removeItem('authToken');
      alert("Аккаунт удалён");
      location.reload();
    } else {
      alert("Ошибка: " + (await res.text()));
    }
  } catch (err) {
    alert("Ошибка сети: " + err.message);
  }
}

// === Выход ===
function logout() {
  localStorage.removeItem('authToken');
  location.reload();
}

// === Отображение личного кабинета ===
function showCabinet() {
  if (!cabinetContent) return;

  cabinetContent.innerHTML = `
    <h3>Ваши объявления</h3>
    <div id="myAds" class="ads-container"></div>
    <button id="addAd" class="button small-btn">Добавить объявление</button>
  `;

  if (userControls) {
    userControls.innerHTML = `
      <button class="button small-btn" onclick="changePassword()">Сменить пароль</button>
      <button class="button small-btn" onclick="logout()">Выйти</button>
    `;
  }

  loadUserAds();
}

// === Меню профиля ===
function updateProfileMenu() {
  const token = localStorage.getItem('authToken');
  const profileDropdown = document.getElementById('profileDropdown');
  if (!profileDropdown) return;

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
  if (!adsContainer) return;
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

// === Бургер-меню ===
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");
const overlay = document.querySelector(".menu-overlay");

function toggleMenu() {
  if (!burger || !menu || !overlay) return;
  burger.classList.toggle("active");
  menu.classList.toggle("active");
  overlay.classList.toggle("active");
  if (window.innerWidth <= 768) document.body.classList.toggle("no-scroll");
}

if (burger && overlay && menu) {
  burger.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", toggleMenu);
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", toggleMenu));
}

// === Иконка профиля ===
const profileIcon = document.getElementById('profileIcon');
const profileDropdown = document.getElementById('profileDropdown');

if (profileIcon && profileDropdown) {
  profileIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    if (!profileDropdown.contains(e.target) && e.target !== profileIcon) {
      profileDropdown.classList.remove('show');
    }
  });
}
