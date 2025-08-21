document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("burger");
  const menu = document.querySelector(".menu");

  // Создаем overlay
  const overlay = document.createElement("div");
  overlay.classList.add("menu-overlay");
  document.body.appendChild(overlay);

  function toggleMenu() {
    burger.classList.toggle("active");
    menu.classList.toggle("active");
    overlay.classList.toggle("active");
  }

  burger.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", toggleMenu);

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", toggleMenu);
  });

  // Маска телефона
  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value
        .replace(/[^\d+]/g, "")
        .replace(/(\+?\d{1,3})(\d{3})(\d{3})(\d{2})(\d{2}).*/, "$1 $2-$3-$4-$5");
    });
  }

  // API загрузка авто
  const API_BASE = "https://cars-api-ur5t.onrender.com";
  const carsList = document.getElementById("cars-list");
  const filters = document.getElementById("filters");

  const carsFilter = [
    "Все марки",
    "Lamborghini",
    "Ferrari",
    "Porsche",
    "BMW",
    "Mercedes",
    "Chevrolet",
    "Audi",
    "Ford",
  ];

  carsFilter.forEach((name, index) => {
    const li = document.createElement("li");
    li.textContent = name;
    if (index === 0) li.classList.add("active");
    li.addEventListener("click", () => {
      document.querySelectorAll("#filters li").forEach((el) => el.classList.remove("active"));
      li.classList.add("active");
      loadCars(name === "Все марки" ? "" : name);
    });
    filters.appendChild(li);
  });

  function loadCars(filter = "") {
    fetch(`${API_BASE}/cars?filter=${filter}`)
      .then((res) => res.json())
      .then((cars) => {
        carsList.innerHTML = "";
        cars.forEach((car) => {
          const article = document.createElement("article");
          article.classList.add("car");
          article.innerHTML = `
            <img src="${car.image}" alt="${car.title}" />
            <div class="car-details">
              <h4>${car.title}</h4>
              <p>${car.text}</p>
              <div class="car-action">
                <ul>
                  <li><div class="car-period">на 1 сутки</div><div class="car-price">${car.prices[0]} $</div></li>
                  <li><div class="car-period">на 1-3 суток</div><div class="car-price">${car.prices[1]} $/сут</div></li>
                  <li><div class="car-period">на 3+ суток</div><div class="car-price">${car.prices[2]} $/сут</div></li>
                </ul>
                <a href="#order" class="button white-button" onclick="document.getElementById('car').value='${car.title}'">Забронировать</a>
              </div>
            </div>
          `;
          carsList.appendChild(article);
        });
      })
      .catch(() => {
        carsList.innerHTML = "<p>Ошибка загрузки автомобилей</p>";
      });
  }

  loadCars();
});
