const API_BASE = "https://cars-api-ur5t.onrender.com";

async function loadCars() {
  try {
    const res = await fetch(`${API_BASE}/api/cars`);
    const cars = await res.json();

    const list = document.getElementById("cars-list");
    list.innerHTML = "";

    cars.forEach(c => {
      const item = document.createElement("div");
      item.className = "car-card";
      item.innerHTML = `
        <img src="${c.imageUrl}" alt="${c.brand} ${c.model}">
        <h3>${c.brand} ${c.model} (${c.year})</h3>
        <p>${c.description}</p>
        <strong>$${c.price.toLocaleString()}</strong>
      `;
      list.appendChild(item);
    });
  } catch (err) {
    console.error("Ошибка загрузки:", err);
  }
}

loadCars();
