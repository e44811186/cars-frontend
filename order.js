document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "https://cars-api-ur5t.onrender.com/api";
  const form = document.getElementById("orderform");
  const select = document.getElementById("car-select");
  const manualInput = document.getElementById("car-manual");
  const phoneInput = document.getElementById("phone");
  const msg = document.getElementById("message");

  // Маска телефона
  Inputmask({ mask: "+7 (999) 999-99-99" }).mask(phoneInput);

  // Подгружаем авто в select
  try {
    const res = await fetch(`${API_BASE}/cars`);
    const cars = await res.json();
    cars.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.brand} ${c.model}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Ошибка загрузки авто:", err);
  }

  // Подставляем выбранное авто из localStorage
  const saved = localStorage.getItem("orderData");
  if (saved) {
    const data = JSON.parse(saved);
    if (data.carId) {
      select.value = data.carId;
    }
    if (data.carName) {
      manualInput.value = data.carName;
    }
  }

  // Отправка формы
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const carId = select.value;
    const carName = manualInput.value.trim();

    if (!name || !phone || (!carId && !carName)) {
      msg.textContent = "❌ Заполните все поля!";
      msg.style.color = "red";
      return;
    }

    const payload = {
      name,
      phone,
      carId: carId ? Number(carId) : null,
      carName: carName || null,
    };

    try {
      // Отправка на API
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
      console.error(err);
    }
  });
});
