// === profile-menu.js ===
// Централизованное управление иконкой профиля, выпадающим меню и авторизацией

const API_URL = "https://cars-api-ur5t.onrender.com/api/auth";

// ======== Элементы ========
const profileIcon = document.getElementById('profileIcon');
const profileDropdown = document.getElementById('profileDropdown');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const changePassLink = document.getElementById('changePassLink');
const logoutLink = document.getElementById('logoutLink');
const deleteAccLink = document.getElementById('deleteAccLink');
const profileLink = document.getElementById('profileLink');

// ======== Токен ========
const token = localStorage.getItem('authToken');

// ======== Показ меню при клике на иконку ========
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

// ======== Обновление видимости пунктов меню ========
function updateProfileMenu() {
  const loggedIn = !!localStorage.getItem('authToken');
  if (!profileDropdown) return;

  profileLink && (profileLink.style.display = loggedIn ? 'block' : 'none');
  changePassLink && (changePassLink.style.display = loggedIn ? 'block' : 'none');
  logoutLink && (logoutLink.style.display = loggedIn ? 'block' : 'none');
  deleteAccLink && (deleteAccLink.style.display = loggedIn ? 'block' : 'none');
  loginLink && (loginLink.style.display = loggedIn ? 'none' : 'block');
  registerLink && (registerLink.style.display = loggedIn ? 'none' : 'block');
}
updateProfileMenu();

// ======== Войти ========
loginLink && loginLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (typeof openAuthModal === "function") {
    openAuthModal();
    // показать именно форму логина
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('registerModal').style.display = 'none';
  } else {
    window.location.href = "cabinet.html";
  }
});

// ======== Зарегистрироваться ========
registerLink && registerLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (typeof openAuthModal === "function") {
    openAuthModal();
    // показать именно форму регистрации
    document.getElementById('registerModal').style.display = 'block';
    document.getElementById('loginModal').style.display = 'none';
  } else {
    window.location.href = "cabinet.html";
  }
});

// ======== Сменить пароль ========
changePassLink && changePassLink.addEventListener('click', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('authToken');
  if (!token) return alert("Сначала войдите в аккаунт");

  const oldPassword = prompt("Введите старый пароль:");
  const newPassword = prompt("Введите новый пароль (минимум 6 символов):");
  if (!oldPassword || !newPassword) return;
  if (newPassword.length < 6) return alert("Слишком короткий пароль!");

  try {
    const res = await fetch(`${API_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    if (!res.ok) throw new Error(await res.text());
    alert("Пароль успешно изменён");
  } catch (err) {
    alert("Ошибка: " + err.message);
  }
});

// ======== Выход ========
logoutLink && logoutLink.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('authToken');
  alert("Вы вышли из аккаунта");
  updateProfileMenu();
  window.location.reload();
});

// ======== Удаление аккаунта ========
deleteAccLink && deleteAccLink.addEventListener('click', async (e) => {
  e.preventDefault();
  if (!confirm("Удалить аккаунт безвозвратно?")) return;

  const token = localStorage.getItem('authToken');
  if (!token) return alert("Вы не вошли в систему");

  try {
    const res = await fetch(`${API_URL}/delete`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(await res.text());

    localStorage.removeItem('authToken');
    alert("Аккаунт удалён");
    window.location.reload();
  } catch (err) {
    alert("Ошибка удаления: " + err.message);
  }
});
