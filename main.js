document.addEventListener("DOMContentLoaded", () => {
  const carsContainer = document.getElementById("cars-content");
  const orderForm = document.getElementById("orderForm");
  const carInput = document.getElementById("car");
  const phoneInput = document.getElementById("phone");

  // Load cars
  fetch("https://cars-api-ur5t.onrender.com/cars")
    .then(res => res.json())
    .then(cars => {
      carsContainer.innerHTML = cars.map(car => `
        <article class="car">
          <img src="${car.image}" alt="${car.title}" width="300" height="200" loading="lazy" />
          <div class="car-details">
            <h4>${car.title}</h4>
            <p>${car.text}</p>
            <div class="car-action">
              <ul>
                <li><div class="car-period">на 1 сутки</div><div class="car-price">${car.prices[0]} $</div></li>
                <li><div class="car-period">на 1-3 суток</div><div class="car-price">${car.prices[1]} $/сут</div></li>
                <li><div class="car-period">на 3+ суток</div><div class="car-price">${car.prices[2]} $/сут</div></li>
              </ul>
              <button class="button" onclick="document.getElementById('car').value='${car.title}';window.location='#order';">Забронировать</button>
            </div>
          </div>
        </article>
      `).join("");
    });

  // Phone mask
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      let value = this.value.replace(/\D/g, "");
      if (!value) return (this.value = "");
      value = value.substring(0, 11);
      let formatted = "+";
      if (value[0] === "7" || value[0] === "8") {
        formatted += "7 ";
        value = value.substring(1);
      } else {
        formatted += value[0];
        value = value.substring(1);
      }
      if (value.length > 0) formatted += "(" + value.substring(0, 3);
      if (value.length >= 4) formatted += ") " + value.substring(3, 6);
      if (value.length >= 7) formatted += "-" + value.substring(6, 8);
      if (value.length >= 9) formatted += "-" + value.substring(8, 10);
      this.value = formatted;
    });
  }

  // Order submit
  orderForm.addEventListener("submit", e => {
    e.preventDefault();
    const data = {
      car: carInput.value,
      name: document.getElementById("name").value,
      phone: phoneInput.value
    };
    fetch("https://testologia.ru/cars-order", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(resp => {
      alert(resp.message || "Заявка отправлена!");
      orderForm.reset();
    })
    .catch(() => alert("Ошибка при отправке заявки"));
  });
});

