document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "https://cars-api-ur5t.onrender.com/api";
  const form = document.getElementById("orderform");
  const carManual = document.getElementById("car-manual");
  const carDropdown = document.getElementById("car-dropdown");
  const msg = document.getElementById("message");
  const submitBtn = form.querySelector("button[type=submit]");

  let cars = [];

  // Подгружаем авто
  try {
    const res = await fetch(`${API_BASE}/cars`);
    cars = await res.json();
    populateDropdown(cars);
  } catch (err) {
    console.error("Ошибка загрузки авто:", err);
  }

  function populateDropdown(cars) {
    carDropdown.innerHTML = "";
    cars.forEach(c => {
      const li = document.createElement("li");
      li.textContent = `${c.brand} ${c.model}`;
      li.dataset.id = c.id;
      carDropdown.appendChild(li);
    });
  }

  // показать список при фокусе
  carManual.addEventListener("focus", () => {
    carDropdown.style.display = "block";
  });

  // фильтрация при вводе
  carManual.addEventListener("input", () => {
    const val = carManual.value.toLowerCase();
    Array.from(carDropdown.children).forEach(li => {
      li.style.display = li.textContent.toLowerCase().includes(val) ? "block" : "none";
    });
  });

  // скрыть список при клике вне блока
  document.addEventListener("click", e => {
    if (!e.target.closest(".car-input-wrapper")) {
      carDropdown.style.display = "none";
    }
  });

  // выбор из списка
  carDropdown.addEventListener("click", e => {
    if (e.target.tagName === "LI") {
      carManual.value = e.target.textContent;
      carDropdown.style.display = "none";
    }
  });

  // Маска телефона
  const phoneInput = document.getElementById("phone");
  phoneInput.addEventListener("input", () => {
    let val = phoneInput.value.replace(/\D/g, "");
    if (val.length > 0) {
      val = "+7 (" + val;
      if (val.length > 6) val = val.slice(0, 6) + ") " + val.slice(6);
      if (val.length > 11) val = val.slice(0, 11) + "-" + val.slice(11);
      if (val.length > 14) val = val.slice(0, 14) + "-" + val.slice(14, 16);
    }
    phoneInput.value = val;
  });

  // Отправка формы
  form.addEventListener("submit", async e => {
    e.preventDefault();
    submitBtn.disabled = true; // запрет повторной отправки
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const carName = carManual.value.trim();

    if (!name || !phone || !carName) {
      msg.textContent = "❌ Заполните все поля!";
      msg.style.color = "red";
      submitBtn.disabled = false;
      return;
    }

    const foundCar = cars.find(c => `${c.brand} ${c.model}` === carName);

    const payload = {
      name,
      phone,
      carId: foundCar ? Number(foundCar.id) : null,
      carName: foundCar ? null : carName
    };

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Ошибка сервера");

      msg.textContent = "✅ Заявка отправлена!";
      msg.style.color = "green";
      form.reset();
    } catch (err) {
      msg.textContent = "❌ Ошибка отправки заявки";
      msg.style.color = "red";
      console.error(err);
      submitBtn.disabled = false; // вернуть кнопку если ошибка
    }
  });
});
