const API_BASE = "https://cars-api-ur5t.onrender.com";

async function loadCars() {
  const res = await fetch(`${API_BASE}/api/cars`);
  const cars = await res.json();
  const select = document.querySelector("select[name=car]");
  cars.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.brand} ${c.model}`;
    select.appendChild(opt);
  });
}

document.getElementById("order-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message || "Заявка отправлена!");
    e.target.reset();
  } catch (err) {
    alert("Ошибка отправки");
  }
});

loadCars();
