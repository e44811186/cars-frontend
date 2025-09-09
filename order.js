document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://cars-api-ur5t.onrender.com/api";
  const form = document.getElementById("orderform");
  const select = document.getElementById("car-select");
  const manualInput = document.getElementById("car-manual");
  const msg = document.getElementById("message");
  const phoneInput = document.getElementById("phone");

  // флаг отправки
  let isSubmitting = false;

  // === Маска телефона ===
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      let value = this.value.replace(/\D/g, "").substring(0, 11);
      let formatted = "+";
      if (value[0] === "7" || value[0] === "8") {
        formatted += "7 ";
        value = value.substring(1);
      } else if (value.length > 0) {
        formatted += value[0] + " ";
        value = value.substring(1);
      }
      if (value.length > 0) formatted += "(" + value.substring(0, 3);
      if (value.length >= 4) formatted += ") " + value.substring(3, 6);
      if (value.length >= 7) formatted += "-" + value.substring(6, 8);
      if (value.length >= 9) formatted += "-" + value.substring(8, 10);
      this.value = formatted;
    });
  }

  // === Подгружаем авто в select ===
  (async function loadCars() {
    try {
      const res = await fetch(`${API_BASE}/cars`);
      if (!res.ok) throw new Error("Ошибка при загрузке авто");
      const cars = await res.json();
      // очищаем и вставляем
      select.innerHTML = '<option value="">Выберите авто</option>';
      cars.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.brand} ${c.model}`;
        select.appendChild(opt);
      });
    } catch (err) {
      console.error("Ошибка загрузки авто:", err);
      // оставляем select с единственным вариантом
    }
  })();

  // === Подставляем данные из localStorage (если переход с главной) ===
  try {
    const saved = localStorage.getItem("orderData");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.carId) select.value = data.carId;
      if (data.carName) manualInput.value = data.carName;
    }
  } catch (e) { /* ignore */ }

  // === Отправка формы ===
  if (form) {
    const submitBtn = form.querySelector("button[type=submit]");
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (isSubmitting) return; // уже отправляется/отправлено

      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const carId = select.value;
      const carName = manualInput.value.trim();

      if (!name || !phone || (!carId && !carName)) {
        msg.textContent = "❌ Заполните все поля!";
        msg.style.color = "red";
        return;
      }

      // блокируем кнопку и ставим флаг
      isSubmitting = true;
      submitBtn.disabled = true;
      const prevText = submitBtn.textContent;
      submitBtn.textContent = "Отправка...";

      const payload = {
        name,
        phone,
        carId: carId ? Number(carId) : null,
        carName: carName || null
      };

      try {
        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          // если сервер вернул ошибку — даём возможность повторить
          const txt = await res.text().catch(()=>null);
          throw new Error(txt || "Ошибка сервера");
        }

        // успех — оставляем кнопку заблокированной (чтобы нельзя было отправить ещё раз),
        // и изменяем её текст/показываем сообщение
        submitBtn.textContent = "Отправлено";
        msg.textContent = "✅ Заявка отправлена! Спасибо, мы свяжемся с вами.";
        msg.style.color = "green";

        // очищаем локальное сохранение (если было)
        try { localStorage.removeItem("orderData"); } catch(_) {}
        // не снимаем isSubmitting — это и блокировка до перезагрузки страницы
      } catch (err) {
        console.error("Ошибка при отправке:", err);
        msg.textContent = "❌ Ошибка отправки (попробуйте ещё раз)";
        msg.style.color = "red";
        // разблокируем, позволяем повторить
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.textContent = prevText;
      }
    });
  }
});
