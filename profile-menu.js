// profile-menu.js
(function () {
  const profileIcon = document.getElementById('profileIcon');
  const profileDropdown = document.getElementById('profileDropdown');

  if (!profileIcon || !profileDropdown) {
    // экспорт пустой функции, чтобы другие файлы могли вызывать updateProfileMenu()
    window.updateProfileMenu = window.updateProfileMenu || function () {};
    return;
  }

  // Показываем/скрываем меню при клике на иконку
  profileIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('show');
  });

  // Скрыть при клике вне
  document.addEventListener('click', (e) => {
    if (!profileDropdown.contains(e.target) && e.target !== profileIcon) {
      profileDropdown.classList.remove('show');
    }
  });

  // Делегируем клики внутри меню, предотвращаем переход по href
  profileDropdown.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    const id = a.id;

    // открытие модалки для входа/регистрации реализует auth-modal.js
    if (id === 'loginLink') {
      if (window.openAuthModal) window.openAuthModal('login');
    } else if (id === 'registerLink') {
      if (window.openAuthModal) window.openAuthModal('register');
    } else if (id === 'logoutLink') {
      if (window.logout) window.logout();
      else { localStorage.removeItem('authToken'); location.reload(); }
    } else if (id === 'changePassLink') {
      if (window.changePassword) window.changePassword();
    } else if (id === 'deleteAccLink') {
      if (window.deleteAccount) window.deleteAccount();
    } else if (a.dataset && a.dataset.href) {
      // если в разметке указано data-href, разрешаем навигацию через js
      window.location.href = a.dataset.href;
    }

    profileDropdown.classList.remove('show');
  });

  // Функция обновления меню (вид для залогиненного/гостя).
  // auth-modal.js будет вызывать window.updateProfileMenu() после логина/логаута.
  window.updateProfileMenu = function () {
    const token = localStorage.getItem('authToken');

    if (token) {
      profileDropdown.innerHTML = `
        <a href="#" id="openCabinet" data-href="cabinet.html">Профиль</a>
        <a href="#" id="changePassLink">Сменить пароль</a>
        <a href="#" id="logoutLink">Выйти</a>
        <a href="#" id="deleteAccLink" class="danger">Удалить аккаунт</a>
      `;
    } else {
      profileDropdown.innerHTML = `
        <a href="#" id="loginLink">Войти</a>
        <a href="#" id="registerLink">Зарегистрироваться</a>
      `;
    }
  };

  // инициализация
  window.updateProfileMenu();
})();
