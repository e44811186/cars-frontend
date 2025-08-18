const API_BASE = "https://cars-api-ur5t.onrender.com/api/cars";
let allCars = [];

// Генерация цен
function buildPrices(base) {
  const day1 = Math.round(base);
  const day1to3 = Math.round(base * 0.95);
  const day3plus = Math.round(base * 0.9);
  return [day1, day1to3, day3plus];
}

// Создание карточки авто
function createCarArticle(car) {
  const prices = buildPrices(car.price);
  const article = document.createElement('article');
  article.className = 'car';
  article.innerHTML = `
    <img src="${car.imageUrl}" alt="car" />
    <div class="car-details">
      <h4>${car.brand} ${car.model} (${car.year})</h4>
      <p>${car.description}</p>
      <div class="car-action">
        <ul>
          ${["на 1 сутки","на 1-3 суток","на 3+ суток"].map((p,i)=>`
            <li>
              <div class="car-period">${p}</div>
              <div class="car-price">${prices[i]} $ ${i>0?'<span>/сут</span>':''}</div>
            </li>
          `).join('')}
        </ul>
        <a href="#order" class="button white-button" data-title="${car.brand} ${car.model}">Забронировать</a>
      </div>
    </div>
  `;

  const btn = article.querySelector('a.button.white-button');
  btn.addEventListener('click', () => {
    document.getElementById('car').value = btn.getAttribute('data-title');
  });

  return article;
}

// Рендер всех авто
function renderCars(cars) {
  const list = document.getElementById('cars-list');
  list.innerHTML = '';
  cars.forEach(c => list.appendChild(createCarArticle(c)));
}

// Рендер списка брендов
function renderBrands() {
  const box = document.getElementById('brands-list');
  box.innerHTML = '';
  const uniq = Array.from(new Set(allCars.map(c => c.brand)));
  
  const makeLi = (name, active=false) => {
    const li = document.createElement('li');
    li.textContent = name;
    if(active) li.classList.add('active');
    li.addEventListener('click', () => {
      [...box.children].forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      if(name === 'Все марки') renderCars(allCars);
      else renderCars(allCars.filter(c => c.brand === name));
      document.getElementById('cars-content').scrollIntoView({behavior:'instant'});
    });
    return li;
  }

  box.appendChild(makeLi('Все марки', true));
  uniq.forEach(b => box.appendChild(makeLi(b)));
}

// Загрузка авто с сервера
async function loadCars() {
  try {
    const res = await fetch(API_BASE);
    allCars = await res.json();
    renderBrands();
    renderCars(allCars);
  } catch(err) {
    console.error('Ошибка загрузки:', err);
  }
}

// Обработка формы заказа
document.getElementById('orderForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const car = document.getElementById('car').value.trim();
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  if(!car || !name || !phone) return alert('Заполните все поля!');
  alert(`Заявка отправлена!\nАвто: ${car}\nИмя: ${name}\nТелефон: ${phone}`);
  e.target.reset();
});

// Запуск
loadCars();
