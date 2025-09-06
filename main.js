document.addEventListener("DOMContentLoaded", () => { 
  const API_BASE = "https://cars-api-ur5t.onrender.com/api/cars";

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

  const phoneInput = document.getElementById("phone");
  phoneInput.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, '').substring(0, 11);
    let formatted = '+';
    if (value[0] === '7' || value[0] === '8') { formatted += '7 '; value = value.substring(1); }
    else { formatted += value[0]; value = value.substring(1); }
    if (value.length > 0) formatted += '(' + value.substring(0, 3);
    if (value.length >= 4) formatted += ') ' + value.substring(3, 6);
    if (value.length >= 7) formatted += '-' + value.substring(6, 8);
    if (value.length >= 9) formatted += '-' + value.substring(8, 10);
    this.value = formatted;
  });

  const lazyObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset && img.dataset.src) {   // проверяем наличие src
          img.src = img.dataset.src;
        }
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: "0px 0px 200px 0px" });

  let allCars = [];
  const brandsList = document.getElementById("brands-list");
  const carsList = document.getElementById("cars-list");

  function buildPrices(base) { 
    return [Math.round(base), Math.round(base * 0.95), Math.round(base * 0.9)]; 
  }

 function createCarArticle(car) {
  const prices = buildPrices(car.price);
  const firstImage = (car.images && car.images.length > 0) ? car.images[0] : '';

  const article = document.createElement('article');
  article.className = 'car';
  article.innerHTML = `
    <img data-src="${firstImage}" alt="car" class="lazy car-thumbnail">
    <div class="car-details">
      <h4>${car.brand} ${car.model} (${car.year})</h4>
      <p>${car.description}</p>
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
  lazyObserver.observe(article.querySelector('img.lazy'));

  // бронирование
  article.querySelector('a.white-button').addEventListener('click', () => {
    document.getElementById('car').value = car.brand + ' ' + car.model;
    document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
  });

  // галерея
  article.querySelector('.car-thumbnail').addEventListener('click', () => {
    openLightbox(car.images || []);
  });

  article.style.opacity = 0;
  article.style.transform = 'translateY(30px)';
  article.style.transition = 'opacity 0.5s, transform 0.5s';
  return article;
}


  function renderCars(cars) {
    carsList.innerHTML = '';
    cars.forEach((c, idx) => {
      const article = createCarArticle(c);
      carsList.appendChild(article);
      setTimeout(() => { 
        article.style.opacity = 1; 
        article.style.transform = 'translateY(0)'; 
      }, idx * 100);
    });
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
      const res = await fetch(API_BASE);
      allCars = await res.json();
      renderBrands();
      renderCars(allCars);
    } catch (err) { console.error(err); }
  }

  document.getElementById('orderForm').addEventListener('submit', e => {
    e.preventDefault();
    const car = document.getElementById('car').value.trim();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    if (!car || !name || !phone) return;
    alert(`Заявка отправлена!\nАвто: ${car}\nИмя: ${name}\nТелефон: ${phone}`);
    e.target.reset();
  });

  loadCars();
});
// === Lightbox ===
let currentIndex = 0;
let currentImages = [];

function openLightbox(images) {
  currentImages = images;
  currentIndex = 0;
  renderLightbox();
  document.getElementById("lightbox").classList.add("active");
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("active");
}

function renderLightbox() {
  const img = document.querySelector("#lightbox img");
  if (currentImages.length > 0) {
    img.src = currentImages[currentIndex];
  }
}

function nextImage() {
  if (currentImages.length > 1) {
    currentIndex = (currentIndex + 1) % currentImages.length;
    renderLightbox();
  }
}

function prevImage() {
  if (currentImages.length > 1) {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    renderLightbox();
  }
}

// обработка клавиш
document.addEventListener("keydown", e => {
  if (!document.getElementById("lightbox").classList.contains("active")) return;
  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") prevImage();
  if (e.key === "Escape") closeLightbox();
});
