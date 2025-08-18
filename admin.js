const API_BASE = "https://cars-api-ur5t.onrender.com";

async function loadOrders() {
  const res = await fetch(`${API_BASE}/api/orders`);
  const orders = await res.json();

  const tbody = document.querySelector("#orders-table tbody");
  tbody.innerHTML = "";
  orders.forEach(o => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${o.name}</td>
      <td>${o.phone}</td>
      <td>${o.carName}</td>
      <td>${new Date(o.createdAt).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

loadOrders();

