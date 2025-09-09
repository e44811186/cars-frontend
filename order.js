document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "https://cars-api-ur5t.onrender.com/api";
  const form = document.getElementById("orderform");
  const carManual = document.getElementById("car-manual");
  const msg = document.getElementById("message");
  const submitBtn = form.querySelector("button[type=submit]");
  const phoneInput = document.getElementById("phone");

  let cars = [];

  // Загружаем авто в выпадающий список
  try {
    const res = await fetch(`${API_BASE}/cars`);
    cars = await res.json();
  } catch (err) {
    console.error("Ошибка загрузки авто:", err);
  }

  // Подставляем сохранённое авто из localStorage
  const saved = localStorage.getItem("orderData");
  if (saved) {
    const data = JSON.parse(saved);
    if (data.carName) {
      carManual.value = data.carName;
    }
  }

  // Маска телефона
  function setCursorPosition(pos, elem) {
    elem.focus();
    if (elem.setSelectionRange) elem.setSelectionRange(pos, pos);
  }

  function mask(event) {
    let matrix = "+7 (___) ___-__-__",
      i = 0,
      def = matrix.replace(/\D/g, ""),
      val = this.value.replace(/\D/g, "");

    if (def.length >= val.length) val = def;

    this.value = matrix.replace(/./g, function(a) {
      return /[_\d]/.test(a) && i < val.length
        ? val.charAt(i++)
        : i >= val.length ? "" : a;
    });

    if (event.type === "blur") {
      if (this.value.length < 5) this.value = "";
    } else {
      setCursorPosition(this.value.length, this);
    }
  }

  phoneInput.addEventListener("input", mask, false);
  phoneInput.addEventListener("focus", mask, false);
  phoneInput.addEventListener("blur", mask, false);

  // Отправка формы
  form.addEventListener("submit", async e => {
    e.preventDefault();
    submitBtn.disabled = true;

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
      localStorage.removeItem("orderData");
    } catch (err) {
      msg.textContent = "❌ Ошибка отправки заявки";
      msg.style.color = "red";
      submitBtn.disabled = false;
      console.error(err);
    }
  });
});
