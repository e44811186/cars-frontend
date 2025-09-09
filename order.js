const API_BASE = "https://cars-api-ur5t.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const orderForm = document.getElementById("order-form");

  if (orderForm) {
    orderForm.addEventListener("submit", async e => {
      e.preventDefault();

      const carField = document.getElementById("car");
      const carId = carField.dataset.id;
      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();

      if (!carId || !name || !phone) {
        showMessage("❌ Заполните все поля!", true);
        return;
      }

      const data = { name, phone, carId: Number(carId) };

      try {
        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Ошибка сервера");

        showMessage("✅ Заявка успешно отправлена!");
        orderForm.reset();
        carField.dataset.id = "";
      } catch (err) {
        console.error("Ошибка при заказе:", err);
        showMessage("❌ Ошибка отправки заявки", true);
      }
    });
  }

  function showMessage(text, isError = false) {
    const msg = document.getElementById("message");
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = isError ? "red" : "green";
  }
});
