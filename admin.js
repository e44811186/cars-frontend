const API_BASE = "https://cars-api-ur5t.onrender.com";

document.getElementById('adminForm').addEventListener('submit', async e => {
  e.preventDefault();
  const car = {
    brand: document.getElementById('brand').value,
    model: document.getElementById('model').value,
    year: +document.getElementById('year').value,
    price: +document.getElementById('price').value,
    imageUrl: document.getElementById('imageUrl').value,
    description: document.getElementById('description').value
  };

  try {
    const res = await fetch(`${API_BASE}/api/cars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(car)
    });

    if (res.ok) {
      alert('Авто добавлено!');
      e.target.reset();
    } else {
      alert('Ошибка при добавлении авто');
    }
  } catch (err) {
    console.error(err);
    alert('Ошибка при добавлении');
  }
});
