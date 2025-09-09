const API_BASE = "https://cars-api-ur5t.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
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

  if (burger && overlay && menu) {
    burger.addEventListener("click", toggleMenu);
    overlay.addEventListener("click", toggleMenu);
    menu.querySelectorAll("a").forEach(link =>
      link.addEventListener("click", toggleMenu)
    );
  }

  // ==== Lazy-load изображений ====
  const lazyObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset && img.dataset.src) {
                  img.src = img.dataset.src;
                }
                img.classList.remove("lazy");
                observer.unobserve(img);
              }
            });
          },
          { rootMargin: "0px 0px 200px 0px", threshold: 0.01 }
        )
      : {
          observe: img => {
            img.src = img.dataset.src;
            img.classList.remove("lazy");
          },
        };

  let allCars = [];
  const brandsList = document.getElementById("brands-list");
  const carsList = document.getElementById("cars-list");

  const getPrimaryImage = car =>
    Array.isArray(car.images) && car.images.length > 0
      ? car.images[0]
      : car.imageUrl || "";

  const getAllImages = car =>
    Array.isArray(car.images) && car.images.length > 0
      ? car.images
      : car.imageUrl
      ? [car.imageUrl]
      : [];

  function buildPrices(base) {
    const b = Number(base) || 0;
    return [Math.round(b), Math.round(b * 0.95), Math.round(b * 0.9)];
  }

  function createCarArticle(car) {
    const prices = buildPrices(car.price);
    const firstImage = getPrimaryImage(car);

    const article = document.createElement("article");
    article.className = "car";
    article.innerHTML = `
      <img data-src="${firstImage}" alt="${car.brand} ${car.model}" class="lazy car-thumbnail" loading="lazy">
      <div class="car-details">
        <h4>${car.brand} ${car.model} (${car.year})</h4>
        <p>${car.description || ""}</p>
        <div class="car-action">
          <ul>
            ${["на 1 сутки", "на 1-3 суток", "на 3+ суток"]
              .map(
                (p, i) => `
              <li>
                <div class="car-period">${p}</div>
                <div class="car-price">${prices[i]} ₽${i > 0 ? "<span>/сут</span>" : ""}</div>
              </li>`
              )
              .join("")}
          </ul>
          <a href="#order" class="button white-button" data-id="${car.id}" data-title="${car.brand} ${car.model}">Забронировать</a>
        </div>
      </div>
    `;

    const thumb = article.querySelector("img.lazy");
    if (thumb) lazyObserver.observe(thumb);

    // кнопка "Забронировать"
    article.querySelector("a.white-button").addEventListener("click", () => {
      const carField = document.getElementById("car");
      if (carField) {
        carField.value = `${car.brand} ${car.model}`;
        carField.dataset.id = car.id;
      }
      document.getElementById("order").scrollIntoView({ behavior: "smooth" });
    });

    return article;
  }

  function renderCars(cars) {
    carsList.innerHTML = "";
    cars.forEach(c => {
      const article = createCarArticle(c);
      carsList.appendChild(article);
    });
  }

  function renderBrands() {
    brandsList.innerHTML = "";
    const uniq = ["Все марки", ...Array.from(new Set(allCars.map(c => c.brand)))];
    uniq.forEach((brand, idx) => {
      const li = document.createElement("li");
      li.textContent = brand;
      if (idx === 0) li.classList.add("active");
      li.addEventListener("click", () => {
        Array.from(brandsList.children).forEach(el =>
          el.classList.remove("active")
        );
        li.classList.add("active");
        renderCars(
          brand === "Все марки"
            ? allCars
            : allCars.filter(c => c.brand === brand)
        );
      });
      brandsList.appendChild(li);
    });
  }

  async function loadCars() {
    try {
      const res = await fetch(`${API_BASE}/cars`);
      allCars = await res.json();
      renderBrands();
      renderCars(allCars);
    } catch (err) {
      console.error("Ошибка загрузки авто:", err);
    }
  }

  loadCars();
});
