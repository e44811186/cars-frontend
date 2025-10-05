// === ВСТАВЬ ЭТО В НАЧАЛО auth-modal.js ===
(function ensureAuthModalExists() {
  if (!document.getElementById('authModal')) {
    const modalHTML = `
      <div id="authModal" class="modal-overlay">
        <div id="loginModal" class="auth-modal">
          <h2>Вход</h2>
          <form id="loginForm">
            <input type="text" name="username" placeholder="Имя пользователя" required>
            <input type="password" name="password" placeholder="Пароль" required>
            <span class="toggle-password">👁️</span>
            <button type="submit">Войти</button>
          </form>
          <div class="toggle" id="toRegister">Нет аккаунта? Зарегистрироваться</div>
        </div>
        <div id="registerModal" class="auth-modal" style="display:none;">
          <h2>Регистрация</h2>
          <form id="registerForm">
            <input type="text" name="username" placeholder="Имя пользователя" required>
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Пароль" required>
            <span class="toggle-password">👁️</span>
            <button type="submit">Создать аккаунт</button>
          </form>
          <div class="toggle" id="toLogin">Уже есть аккаунт? Войти</div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
})();
// auth-modal.js
(function () {
  const API_URL = "https://cars-api-ur5t.onrender.com/api/auth";

  // элементы модалки
  const authModal = document.getElementById('authModal');
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const toRegister = document.getElementById('toRegister');
  const toLogin = document.getElementById('toLogin');

  function openAuthModal(mode = 'login') {
    if (!authModal) return;
    document.body.classList.add('modal-open');
    authModal.classList.add('active');
    if (mode === 'register') {
      if (loginModal) loginModal.style.display = 'none';
      if (registerModal) registerModal.style.display = 'block';
    } else {
      if (loginModal) loginModal.style.display = 'block';
      if (registerModal) registerModal.style.display = 'none';
    }
  }

  function closeAuthModal() {
    if (!authModal) return;
    document.body.classList.remove('modal-open');
    authModal.classList.remove('active');
  }

  function disableButton(btn, time = 1500) {
    if (!btn) return;
    btn.disabled = true;
    btn.classList && btn.classList.add('disabled');
    setTimeout(() => {
      btn.disabled = false;
      btn.classList && btn.classList.remove('disabled');
    }, time);
  }

  // переключение форм
  if (toRegister) toRegister.addEventListener('click', () => openAuthModal('register'));
  if (toLogin) toLogin.addEventListener('click', () => openAuthModal('login'));

  // показать/скрыть пароль (иконка рядом с полем должна иметь class="toggle-password")
  document.addEventListener('click', (e) => {
    const t = e.target.closest('.toggle-password');
    if (!t) return;
    const inp = t.previousElementSibling;
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
    t.textContent = inp.type === 'password' ? '👁️' : '🙈';
  });

  // --- LOGIN ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('button');
      disableButton(btn, 2000);

      const payload = {
        username: loginForm.username.value.trim(),
        password: loginForm.password.value
      };

      try {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => null);
          throw new Error(txt || 'Ошибка входа');
        }

        // ожидаем JSON { token: "..." } или похожий
        const json = await res.json().catch(() => null);
        const token = json && (json.token || json.accessToken || json.authToken);

        if (!token) {
          // если сервер возвращает строку успеха, сообщаем и закрываем модалку
          alert('Вход выполнен, но токен не получен от сервера.');
        } else {
          localStorage.setItem('authToken', token);
        }

        // обновляем меню
        if (typeof window.updateProfileMenu === 'function') window.updateProfileMenu();

        closeAuthModal();
        // не делаем автоматический переход в кабинет — пользователь сам нажмёт "Профиль" или перейдёт
      } catch (err) {
        alert(err.message || 'Ошибка входа');
      }
    });
  }

  // --- REGISTER ---
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = registerForm.querySelector('button');
      disableButton(btn, 2000);

      const payload = {
        username: registerForm.username.value.trim(),
        email: registerForm.email ? registerForm.email.value.trim() : undefined,
        password: registerForm.password.value
      };

      try {
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => null);
          throw new Error(txt || 'Ошибка регистрации');
        }

        // сервер может вернуть текст (сообщение) или JSON с токеном
        const bodyText = await res.text().catch(() => '');
        let token = null;
        try { const j = JSON.parse(bodyText); token = j.token || j.accessToken || j.authToken || null; } catch(_) {}

        if (token) {
          localStorage.setItem('authToken', token);
          if (typeof window.updateProfileMenu === 'function') window.updateProfileMenu();
          closeAuthModal();
        } else {
          // если вернулся простой текст — показываем и переключаем на форму входа
          alert(bodyText || 'Регистрация успешна. Войдите в аккаунт.');
          // переключаем в логин и подставляем имя
          openAuthModal('login');
          if (loginForm && registerForm) loginForm.username.value = registerForm.username.value || '';
        }
      } catch (err) {
        alert(err.message || 'Ошибка регистрации');
      }
    });
  }

  // --- CHANGE PASSWORD ---
  async function changePassword() {
    const oldPassword = prompt("Введите старый пароль:");
    if (!oldPassword) return;
    const newPassword = prompt("Введите новый пароль (не короче 6 символов):");
    if (!newPassword || newPassword.length < 6) return alert("Неверный новый пароль");

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return alert('Вы не авторизованы');

      const res = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      if (!res.ok) throw new Error(await res.text().catch(() => 'Ошибка'));
      alert('Пароль успешно изменён');
    } catch (err) {
      alert('Ошибка: ' + (err.message || err));
    }
  }

  // --- DELETE ACCOUNT ---
  async function deleteAccount() {
    if (!confirm('Удалить аккаунт безвозвратно?')) return;
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return alert('Вы не авторизованы');

      const res = await fetch(`${API_URL}/delete`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(await res.text().catch(() => 'Ошибка'));
      localStorage.removeItem('authToken');
      if (typeof window.updateProfileMenu === 'function') window.updateProfileMenu();
      alert('Аккаунт удалён');
      location.reload();
    } catch (err) {
      alert('Ошибка: ' + (err.message || err));
    }
  }

  // --- LOGOUT ---
  function logout() {
    localStorage.removeItem('authToken');
    if (typeof window.updateProfileMenu === 'function') window.updateProfileMenu();
    location.reload();
  }

  // экспорт функций в глобальную область, чтобы profile-menu.js мог вызывать
  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;
  window.logout = logout;
  window.changePassword = changePassword;
  window.deleteAccount = deleteAccount;

  // при загрузке обновляем профильный пункт (если profile-menu.js уже подключён, updateProfileMenu будет существовать)
  if (typeof window.updateProfileMenu === 'function') window.updateProfileMenu();

  // если пользователь на странице cabinet.html и не залогинен — открываем модалку автоматически
  try {
    if (location.pathname.endsWith('cabinet.html') && !localStorage.getItem('authToken')) {
      openAuthModal('login');
    }
  } catch (_) {}
})();
