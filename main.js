const API_ROOT = "https://cars-api-ur5t.onrender.com";
const CARS_URL = `${API_ROOT}/api/cars`;

const brandsList = document.getElementById("brands-list");
const carsList = document.getElementById("cars-list");
const orderForm = document.getElementById("orderForm");
const carInput = document.getElementById("car");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");

let allCars = [];

const buildPrices = (base) => [Math.round(base), Math.round(base * 0.95), Math.round(base * 0.9)];

function createCarArticle(car) {
  const prices = buildPrices(car.price);
  const article = document.createElement("article");
  article.className = "car";
  article.innerHTML = `
    <img src="${car.imageUrl}" alt="${car.brand} ${car.model}" loading="lazy" />
    <div class="car-details">
      <h4>${car.brand} ${car.model} (${car.year})</h4>
      <p>${car.description}</p>
      <div class="car-action">
        <ul>
          ${["на 1 сутки", "на 1-3 суток", "на 3+ суток"]
            .map(
              (p, i) => `
            <li>
              <div class="car-period">${p}</div>
              <div class="car-price">${prices[i].toLocaleString()} $ ${i > 0 ? "<span>/сут</span>" : ""}</div>
            </li>`
            )
            .join("")}
        </ul>
        <a href="#order" class="button white-button" data-title="${car.brand} ${car.model}">Забронировать</a>
      </div>
    </div>
  `;

  article.querySelector("a.white-button").addEventListener("click", () => {
    carInput.value = `${car.brand} ${car.model}`;
  });

  return article;
}

function renderCars(cars) {
  carsList.innerHTML = "";
  cars.forEach((c) => carsList.appendChild(createCarArticle(c)));
}

function renderBrands() {
  brandsList.innerHTML = "";
  const uniq = ["Все марки", ...Array.from(new Set(allCars.map((c) => c.brand)))];

  uniq.forEach((brand, idx) => {
    const li = document.createElement("li");
    li.textContent = brand;
    if (idx === 0) li.classList.add("active");
    li.addEventListener("click", () => {
      Array.from(brandsList.children).forEach((el) => el.classList.remove("active"));
      li.classList.add("active");
      renderCars(brand === "Все марки" ? allCars : allCars.filter((c) => c.brand === brand));
      document.getElementById("cars-content").scrollIntoView({ behavior: "instant" });
    });
    brandsList.appendChild(li);
  });
}

async function loadCars() {
  try {
    const res = await fetch(CARS_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allCars = await res.json();
    renderBrands();
    renderCars(allCars);
  } catch (err) {
    console.error("Ошибка загрузки авто:", err);
    carsList.innerHTML = `<div style="color:#f88">Не удалось загрузить автомобили. Попробуйте обновить страницу.</div>`;
  }
}

function attachPhoneMask(input) {
  input.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, "");
    if (!value) {
      this.value = "";
      return;
    }
    value = value.substring(0, 11);

    let formatted = "+";
    if (value[0] === "7" || value[0] === "8") {
      formatted += "7 ";
      value = value.substring(1);
    } else {
      formatted += value[0] || "7";
      value = value.substring(1);
    }
    if (value.length > 0) formatted += "(" + value.substring(0, 3);
    if (value.length >= 4) formatted += ") " + value.substring(3, 6);
    if (value.length >= 7) formatted += "-" + value.substring(6, 8);
    if (value.length >= 9) formatted += "-" + value.substring(8, 10);

    this.value = formatted;
  });
}

function attachOrderSubmit() {
  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const car = carInput.value.trim();
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    if (!car || !name || !phone) return;

    alert(`Заявка отправлена!\nАвто: ${car}\nИмя: ${name}\nТелефон: ${phone}`);
    orderForm.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  attachPhoneMask(phoneInput);
  attachOrderSubmit();
  loadCars();
});
