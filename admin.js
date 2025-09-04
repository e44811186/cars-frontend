const API_BASE = "https://cars-api-ur5t.onrender.com/api/cars";

const form = document.getElementById('adminForm');
const carsTable = document.querySelector('#carsTable tbody');
const searchInput = document.getElementById('searchInput');

let allCars = [];

async function loadCars() {
  try {
    const res = await fetch(API_BASE);
    allCars = await res.json();
    renderCars(allCars);
  } catch (err) {
    console.error(err);
    alert("Ошибка загрузки списка авто");
  }
}

function renderCars(cars) {
  carsTable.innerHTML = '';
  cars.forEach(car => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${car.id}</td>
      <td>${car.brand}</td>
      <td>${car.model}</td>
      <td>${car.year}</td>
      <td>${car.price}</td>
      <td>
        ${car.images && car.images.length > 0
          ? car.images.map(img => `<img src="${img}" class="preview" alt="">`).join('')
          : '—'}
      </td>
      <td class="actions">
        <button onclick="editCar(${car.id}, '${car.brand}', '${car.model}', ${car.year}, ${car.price}, ${JSON.stringify(car.images)}, '${car.description.replace(/'/g, "\\'")}')">✏️ Редактировать</button>
        <button onclick="deleteCar(${car.id})">🗑 Удалить</button>
      </td>
    `;
    carsTable.appendChild(tr);
  });
}

form.addEventListener('submit', async e => {
  e.preventDefault();

  const car = {
    brand: document.getElementById('brand').value,
    model: document.getElementById('model').value,
    year: +document.getElementById('year').value,
    price: +document.getElementById('price').value,
    description: document.getElementById('description').value,
    images: document.getElementById('imageUrls').value
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0)
  };

  const id = document.getElementById('carId').value;

  try {
    let res;
    if (id) {
      res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(car)
      });
    } else {
      res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(car)
      });
    }

    if (res.ok) {
      alert(id ? "Авто обновлено!" : "Авто добавлено!");
      form.reset();
      document.getElementById('carId').value = '';
      loadCars();
    } else {
      alert("Ошибка сохранения авто");
    }
  } catch (err) {
    console.error(err);
    alert("Ошибка при сохранении");
  }
});

async function deleteCar(id) {
  if (!confirm("Удалить это авто?")) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert("Авто удалено");
      loadCars();
    } else {
      alert("Ошибка при удалении");
    }
  } catch (err) {
    console.error(err);
    alert("Ошибка при удалении");
  }
}

function editCar(id, brand, model, year, price, images, description) {
  document.getElementById('carId').value = id;
  document.getElementById('brand').value = brand;
  document.getElementById('model').value = model;
  document.getElementById('year').value = year;
  document.getElementById('price').value = price;
  document.getElementById('imageUrls').value = images ? images.join("\n") : "";
  document.getElementById('description').value = description;
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filtered = allCars.filter(car =>
    car.brand.toLowerCase().includes(query) ||
    car.model.toLowerCase().includes(query)
  );
  renderCars(filtered);
});

loadCars();
