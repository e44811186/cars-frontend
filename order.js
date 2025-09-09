document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "https://cars-api-ur5t.onrender.com/api";
  const form = document.getElementById("orderform");
  const select = document.getElementById("car-select");
  const manualInput = document.getElementById("car-manual");
  const msg = document.getElementById("message");
  const phoneInput = document.getElementById("phone");

  // === Маска телефона ===
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      let value = this.value.replace(/\D/g, "").substring(0, 11);
      let formatted = "+";
      if (value[0] === "7" || value[0] === "8") {
        formatted += "7 ";
        value = value.substring(1);
      } else if (value.length > 0) {
        formatted += value[0] + " ";
        value = value.substring(1);
      }
      if (value.length > 0) formatted += "(" + value.substring(0, 3);
      if (value.length >= 4) formatted += ") " + value.substring(3, 6);
      if (value.length >= 7) formatted += "-" + value.substring(6, 8);
      if (value.length >= 9) formatted += "-" + value.substring(8, 10);
      this.value = formatted;
    });
  }

  // === Подгружаем авто в select ===
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

  // === Подставляем выбранное авто из localStorage ===
  const saved = localStorage.getItem("orderData");
  if (saved) {
    const data = JSON.parse(saved);
    if (data.carId) select.value = data.carId;
    if (data.carName) manualInput.value = data.carName;
  }

  // === Отправка формы ===
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
