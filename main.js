document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://cars-api-ur5t.onrender.com/api";

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
    menu.querySelectorAll("a").forEach(link => link.addEventListener("click", toggleMenu));
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

  const getPrimaryImage = car => {
    if (Array.isArray(car.images) && car.images.length > 0) return car.images[0];
    if (car.imageUrl) return car.imageUrl;
    return "";
  };
  const getAllImages = car => {
    if (Array.isArray(car.images) && car.images.length > 0) return car.images;
    if (car.imageUrl) return [car.imageUrl];
    return [];
  };

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
    article.querySelector("a.white-button").addEventListener("click", e => {
      e.preventDefault();

      // сохраняем выбранное авто в localStorage
      localStorage.setItem(
        "orderData",
        JSON.stringify({ carId: car.id, carName: `${car.brand} ${car.model}` })
      );

      // редиректим в order.html
      window.location.href = "order.html";
    });

    // открытие галереи
    article.querySelector(".car-thumbnail").addEventListener("click", () => {
      openLightbox(getAllImages(car));
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
        Array.from(brandsList.children).forEach(el => el.classList.remove("active"));
        li.classList.add("active");
        renderCars(brand === "Все марки" ? allCars : allCars.filter(c => c.brand === brand));
        document.getElementById("cars-content").scrollIntoView({ behavior: "instant" });
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

  // ==== Лайтбокс ====
  // (оставляем как у тебя)
  // ==== Лайтбокс ====
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbStage = document.getElementById("lb-stage");
  const closeBtn = document.querySelector(".lb-close");
  const nextBtn = document.querySelector(".lb-next");
  const prevBtn = document.querySelector(".lb-prev");
  const lbIndex = document.getElementById("lb-index");
  const lbCount = document.getElementById("lb-count");
  const btnZoomIn = document.getElementById("lb-zoom-in");
  const btnZoomOut = document.getElementById("lb-zoom-out");
  const btnZoomReset = document.getElementById("lb-zoom-reset");

  let currentImages = [];
  let currentIndex = 0;

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;

  function applyTransform() {
    lbImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    lbImg.style.cursor = scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in";
  }

  function setScale(newScale, centerX = lbStage.clientWidth / 2, centerY = lbStage.clientHeight / 2) {
    const oldScale = scale;
    scale = Math.min(5, Math.max(1, newScale));

    const rect = lbImg.getBoundingClientRect();
    const dx = (centerX - rect.left) - rect.width / 2;
    const dy = (centerY - rect.top) - rect.height / 2;
    translateX += dx * (1 / oldScale - 1 / scale);
    translateY += dy * (1 / oldScale - 1 / scale);

    clampPan();
    applyTransform();
  }

  function clampPan() {
    if (scale <= 1) {
      translateX = 0;
      translateY = 0;
      return;
    }
    const maxX = (lbStage.clientWidth * (scale - 1)) / 2;
    const maxY = (lbStage.clientHeight * (scale - 1)) / 2;
    translateX = Math.max(-maxX, Math.min(maxX, translateX));
    translateY = Math.max(-maxY, Math.min(maxY, translateY));
  }

  function resetTransform() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
  }

  function show(index) {
    if (!currentImages.length) return;
    currentIndex = (index + currentImages.length) % currentImages.length;
    lbImg.src = currentImages[currentIndex];
    lbIndex.textContent = String(currentIndex + 1);
    lbCount.textContent = String(currentImages.length);
    resetTransform();
  }

  function openLightbox(images) {
    if (!images || !images.length) return;
    currentImages = images.slice();
    currentIndex = 0;
    show(currentIndex);
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", e => {
    e.stopPropagation();
    show(currentIndex - 1);
  });
  nextBtn.addEventListener("click", e => {
    e.stopPropagation();
    show(currentIndex + 1);
  });
  lightbox.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
  });

  lbStage.addEventListener("dblclick", e => {
    if (scale === 1) setScale(2, e.clientX, e.clientY);
    else resetTransform();
  });

  lbStage.addEventListener(
    "wheel",
    e => {
      e.preventDefault();
      const delta = Math.sign(e.deltaY);
      const factor = delta > 0 ? 0.9 : 1.1;
      setScale(scale * factor, e.clientX, e.clientY);
    },
    { passive: false }
  );

  lbStage.addEventListener("mousedown", e => {
    if (scale <= 1) return;
    isDragging = true;
    dragStartX = e.clientX - translateX;
    dragStartY = e.clientY - translateY;
    applyTransform();
  });
  window.addEventListener("mousemove", e => {
    if (!isDragging) return;
    translateX = e.clientX - dragStartX;
    translateY = e.clientY - dragStartY;
    clampPan();
    applyTransform();
  });
  window.addEventListener("mouseup", () => {
    isDragging = false;
    applyTransform();
  });

  btnZoomIn.addEventListener("click", () => setScale(scale * 1.2));
  btnZoomOut.addEventListener("click", () => setScale(scale / 1.2));
  btnZoomReset.addEventListener("click", resetTransform);

  document.addEventListener("keydown", e => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") show(currentIndex + 1);
    if (e.key === "ArrowLeft") show(currentIndex - 1);
    if (e.key === "+") setScale(scale * 1.2);
    if (e.key === "-") setScale(scale / 1.2);
    if (e.key.toLowerCase() === "r") resetTransform();
  });

  // старт
  loadCars();
});
