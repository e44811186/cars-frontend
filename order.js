document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "https://cars-api-ur5t.onrender.com/api";
  const form = document.getElementById("orderform");
  const carSelect = document.getElementById("car-select");
  const msg = document.getElementById("message");
  const phone = document.getElementById("phone");
  const submitBtn = form ? form.querySelector("button[type=submit]") : null;

  let cars = [];
  let pending = false;

  // === Загрузка списка авто ===
  try {
    const res = await fetch(`${API_BASE}/cars`);
    cars = await res.json();

    if (carSelect) {
      cars.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.brand} ${c.model}`;
        carSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Ошибка загрузки авто:", err);
  }

  // === Подстановка выбранного авто из localStorage ===
  const saved = localStorage.getItem("orderData");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.carId && carSelect) {
        const opt = Array.from(carSelect.options).find(o => o.value == data.carId);
        if (opt) opt.selected = true;
      }
    } catch (e) {
      console.warn("Ошибка чтения localStorage", e);
    }
  }

  // === Маска телефона ===
  if (phone) {
    phone.addEventListener("input", phoneMask, false);
    phone.addEventListener("blur", () => {
      if (!phone.value) phone.value = "";
    }, false);
  }

  function phoneMask(e) {
    const el = e.target;
    let digits = el.value.replace(/\D/g, "");
    if (!digits) {
      el.value = "";
      return;
    }

    // если первый символ 8 → меняем на 7
    if (digits[0] === "8") digits = "7" + digits.slice(1);

    // форматируем только для РФ (начинается с 7)
    if (digits[0] !== "7") {
      el.value = digits;
      return;
    }

    let rest = digits.slice(1).slice(0, 10); // максимум 10 цифр
    const a = rest.slice(0, 3);
    const b = rest.slice(3, 6);
    const c = rest.slice(6, 8);
    const d = rest.slice(8, 10);

    let out = "+7";
    if (a.length) out += " (" + a + ")";
    if (b.length) out += " " + b;
    if (c.length) out += "-" + c;
    if (d.length) out += "-" + d;
    el.value = out;
  }

  // === Отправка формы ===
  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (pending) return;

      const name = form.name.value.trim();
      const phoneVal = phone ? phone.value.trim() : "";
      const carId = carSelect ? carSelect.value : null;

      if (!name || !phoneVal || !carId) {
        showMsg("❌ Заполните все поля!", true);
        return;
      }

      pending = true;
      if (submitBtn) submitBtn.disabled = true;

      const payload = {
        carId: Number(carId),
        name,
        phone: phoneVal
      };

      try {
        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => null);
          throw new Error(txt || "Ошибка сервера");
        }

        showMsg("✅ Заявка отправлена! Мы свяжемся с вами.", false);
        form.reset();
        localStorage.removeItem("orderData");
      } catch (err) {
        console.error("Ошибка отправки заявки:", err);
        showMsg("❌ Ошибка отправки заявки. Попробуйте позже.", true);
      } finally {
        pending = false;
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  function showMsg(text, isError = false) {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = isError ? "red" : "green";
  }
});
