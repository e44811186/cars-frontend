const API_BASE = "https://cars-api-ur5t.onrender.com";

// Загрузка списка авто
async function loadCars() {
  try {
    const res = await fetch(`${API_BASE}/api/cars`);
    if (!res.ok) throw new Error("Ошибка загрузки списка машин");

    const cars = await res.json();
    const select = document.querySelector("select[name=car]");
    select.innerHTML = '<option value="">Выберите авто</option>';

    cars.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.brand} ${c.model} (${c.year})`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    showMessage("Не удалось загрузить список авто", true);
  }
}

// ==== Отправка формы ====
  const orderForm = document.getElementById("order-Form");
  if (orderForm) {
    orderForm.addEventListener("submit", async e => {
      e.preventDefault();

      const carField = document.getElementById("car");
      const carId = carField.dataset.id; // берем id, а не текст
      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();

      if (!carId || !name || !phone) {
        showMessage("❌ Заполните все поля!", true);
        return;
      }

      const data = { name, phone, carId: Number(carId) };

      try {
        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Ошибка сервера");
        showMessage("✅ Заявка успешно отправлена!");
        orderForm.reset();
        carField.dataset.id = ""; // очищаем id
      } catch (err) {
        console.error("Ошибка при заказе:", err);
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

// Загружаем список авто при старте
loadCars();
