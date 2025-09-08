document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://cars-api-ur5t.onrender.com";

  // ==== Бургер/меню ====
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");
  const overlay = document.querySelector(".menu-overlay");

  function toggleMenu() {
    burger.classList.toggle("active");
    menu.classList.toggle("active");
    overlay.classList.toggle("active");
    if (window.innerWidth <= 768) {
      document.body.classList.toggle("no-scroll");
    }
  }
  burger.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", toggleMenu);
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", toggleMenu));

  // ==== Маска телефона ====
  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      let value = this.value.replace(/\D/g, '').substring(0, 11);
      let formatted = '+';
      if (value[0] === '7' || value[0] === '8') { formatted += '7 '; value = value.substring(1); }
      else if (value.length > 0) { formatted += value[0] + ' '; value = value.substring(1); }
      if (value.length > 0) formatted += '(' + value.substring(0, 3);
      if (value.length >= 4) formatted += ') ' + value.substring(3, 6);
      if (value.length >= 7) formatted += '-' + value.substring(6, 8);
      if (value.length >= 9) formatted += '-' + value.substring(8, 10);
      this.value = formatted;
    });
  }

  // ==== Lazy-load изображений ====
  const lazyObserver = ('IntersectionObserver' in window)
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset && img.dataset.src) img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      }, { rootMargin: "0px 0px 200px 0px", threshold: 0.01 })
    : { observe: (img) => { img.src = img.dataset.src; img.classList.remove('lazy'); } };

  let allCars = [];
  const brandsList = document.getElementById("brands-list");
  const carsList = document.getElementById("cars-list");

  const getPrimaryImage = car => (Array.isArray(car.images) && car.images.length > 0) ? car.images[0] : car.imageUrl || "";
  const getAllImages = car => (Array.isArray(car.images) && car.images.length > 0) ? car.images : car.imageUrl ? [car.imageUrl] : [];

  function buildPrices(base) {
    const b = Number(base) || 0;
    return [Math.round(b), Math.round(b * 0.95), Math.round(b * 0.9)];
  }

  function createCarArticle(car) {
    const prices = buildPrices(car.price);
    const firstImage = getPrimaryImage(car);

    const article = document.createElement('article');
    article.className = 'car';
    article.innerHTML = `
      <img data-src="${firstImage}" alt="${car.brand} ${car.model}" class="lazy car-thumbnail" loading="lazy">
      <div class="car-details">
        <h4>${car.brand} ${car.model} (${car.year})</h4>
        <p>${car.description || ''}</p>
        <div class="car-action">
          <ul>
            ${["на 1 сутки", "на 1-3 суток", "на 3+ суток"].map((p, i) => `
              <li>
                <div class="car-period">${p}</div>
                <div class="car-price">${prices[i]} P${i > 0 ? '<span>/сут</span>' : ''}</div>
              </li>`).join('')}
          </ul>
          <a href="#order" class="button white-button" data-title="${car.brand} ${car.model}">Забронировать</a>
        </div>
      </div>
    `;

    // lazy load
    const thumb = article.querySelector('img.lazy');
    if (thumb) lazyObserver.observe(thumb);

    // бронирование — вставляем название авто в форму
    article.querySelector('a.white-button').addEventListener('click', () => {
      const carField = document.getElementById('car');
      if (carField) carField.value = `${car.brand} ${car.model}`;
      document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
    });

    // открытие галереи
    article.querySelector('.car-thumbnail').addEventListener('click', () => openLightbox(getAllImages(car)));

    // анимация появления
    article.style.opacity = 0;
    article.style.transform = 'translateY(30px)';
    requestAnimationFrame(() => {
      setTimeout(() => {
        article.style.transition = 'opacity 0.5s, transform 0.5s';
        article.style.opacity = 1;
        article.style.transform = 'translateY(0)';
      }, 0);
    });

    return article;
  }

  function renderCars(cars) {
    carsList.innerHTML = '';
    cars.forEach(c => carsList.appendChild(createCarArticle(c)));
  }

  function renderBrands() {
    brandsList.innerHTML = '';
    const uniq = ["Все марки", ...Array.from(new Set(allCars.map(c => c.brand)))];
    uniq.forEach((brand, idx) => {
      const li = document.createElement('li');
      li.textContent = brand;
      if (idx === 0) li.classList.add('active');
      li.addEventListener('click', () => {
        Array.from(brandsList.children).forEach(el => el.classList.remove('active'));
        li.classList.add('active');
        renderCars(brand === 'Все марки' ? allCars : allCars.filter(c => c.brand === brand));
        document.getElementById('cars-content').scrollIntoView({ behavior: 'instant' });
      });
      brandsList.appendChild(li);
    });
  }

  async function loadCars() {
    try {
      const res = await fetch(`${API_BASE}`);
      allCars = await res.json();
      renderBrands();
      renderCars(allCars);
    } catch (err) {
      console.error('Ошибка загрузки авто:', err);
    }
  }

  // ==== Форма: реальная отправка через fetch ====
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const car = document.getElementById('car').value.trim();
      if (!name || !phone || !car) return;

      // ищем carId по названию
      const carObj = allCars.find(c => `${c.brand} ${c.model}` === car);
      if (!carObj) { alert("Не удалось определить авто"); return; }

      const data = { name, phone, carId: carObj.id };

      try {
        const res = await fetch(`${API_BASE.replace('cars', 'orders')}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Ошибка сервера");
        showMessage("✅ Заявка успешно отправлена!");
        orderForm.reset();
      } catch (err) {
        console.error(err);
        showMessage("❌ Ошибка отправки заявки", true);
      }
    });
  }

  function showMessage(text, isError = false) {
    const msg = document.getElementById("message");
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = isError ? "red" : "green";
  }

  // ==== Лайтбокс и остальной код ====
  // ... оставляем без изменений (твой существующий код lightbox) ...

  // Старт
  loadCars();
});
