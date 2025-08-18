const form = document.getElementById('addCarForm');
const carsList = document.getElementById('admin-cars-list');

let cars = [];

function renderCars() {
  carsList.innerHTML = '';
  cars.forEach((car, idx) => {
    const div = document.createElement('div');
    div.className = 'car';
    div.innerHTML = `
      <img src="${car.imageUrl}" alt="${car.brand} ${car.model}">
      <h3>${car.brand} ${car.model}</h3>
      <p>${car.description}</p>
      <button class="button" data-idx="${idx}">Удалить</button>
    `;
    const btn = div.querySelector('button');
    btn.addEventListener('click', () => {
      cars.splice(idx,1);
      renderCars();
    });
    carsList.appendChild(div);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const car = {
    brand: document.getElementById('brand').value,
    model: document.getElementById('model').value,
    year: document.getElementById('year').value,
    price: document.getElementById('price').value,
    imageUrl: document.getElementById('imageUrl').value,
    description: document.getElementById('description').value
  };
  cars.push(car);
  renderCars();
  e.target.reset();
});
