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
        <button class="edit-btn" data-id="${car.id}">✏️ Редактировать</button>
        <button onclick="deleteCar(${car.id})">🗑 Удалить</button>
      </td>
    `;
    carsTable.appendChild(tr);

    // исправляем заполнение формы
    tr.querySelector(".edit-btn").addEventListener("click", () => {
      document.getElementById('carId').value = car.id;
      document.getElementById('brand').value = car.brand;
      document.getElementById('model').value = car.model;
      document.getElementById('year').value = car.year;
      document.getElementById('price').value = car.price;
      document.getElementById('imageUrls').value = car.images ? car.images.join("\n") : "";
      document.getElementById('description').value = car.description;
    });
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

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filtered = allCars.filter(car =>
    car.brand.toLowerCase().includes(query) ||
    car.model.toLowerCase().includes(query)
  );
  renderCars(filtered);
});

loadCars();
