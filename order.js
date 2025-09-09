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

// Отправка формы
document.getElementById("orderform").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector("button");
  btn.disabled = true;

  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const carId = Number(form.car.value);

  const data = { name, phone, carId };

  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Сервер вернул ошибку");

    await res.json();
    showMessage("✅ Заявка успешно отправлена!");
    form.reset();
  } catch (err) {
    console.error(err);
    showMessage("❌ Ошибка отправки заявки", true);
  } finally {
    btn.disabled = false;
  }
});

// Сообщения пользователю
function showMessage(text, isError = false) {
  const msg = document.getElementById("message");
  msg.textContent = text;
  msg.style.color = isError ? "red" : "green";
}

// Загружаем список авто при старте
loadCars();
