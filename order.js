// order.js
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://cars-api-ur5t.onrender.com/api"; // убедитесь, что правильно
  const form = document.getElementById("orderform");
  const select = document.getElementById("car-select");
  const manualInput = document.getElementById("car-manual");
  const msg = document.getElementById("message");
  const phoneInput = document.getElementById("phone");
  const submitBtn = form ? form.querySelector("button[type=submit]") : null;

  let allCars = [];
  let isSubmitting = false;
  let isSubmittedSuccessfully = false;

  function showMessage(text, isError = false) {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = isError ? "red" : "green";
  }

  // === Phone mask (как было раньше) ===
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      // сохраняем позицию курсора не строго — но форматируем
      let digits = this.value.replace(/\D/g, "").substring(0, 11);
      let formatted = "+";
      if (digits[0] === "7" || digits[0] === "8") {
        formatted += "7 ";
        digits = digits.substring(1);
      } else if (digits.length > 0) {
        formatted += digits[0] + " ";
        digits = digits.substring(1);
      }
      if (digits.length > 0) formatted += "(" + digits.substring(0, 3);
      if (digits.length >= 4) formatted += ") " + digits.substring(3, 6);
      if (digits.length >= 7) formatted += "-" + digits.substring(6, 8);
      if (digits.length >= 9) formatted += "-" + digits.substring(8, 10);
      this.value = formatted;
    });
  }

  // === Load cars into select ===
  async function loadCars() {
    try {
      const res = await fetch(`${API_BASE}/cars`);
      if (!res.ok) throw new Error(`Failed to load cars: ${res.status}`);
      allCars = await res.json();
      populateSelect();
      // если был выбор в localStorage — восстановим
      restoreSaved();
    } catch (err) {
      console.error("Ошибка загрузки списка машин:", err);
      showMessage("Не удалось загрузить список авто", true);
    }
  }

  function populateSelect() {
    if (!select) return;
    select.innerHTML = '<option value="">Выберите авто</option>';
    allCars.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.brand} ${c.model}` + (c.year ? ` (${c.year})` : "");
      select.appendChild(opt);
    });
  }

  // === Синхронизация select <-> manual input ===
  if (select && manualInput) {
    select.addEventListener("change", () => {
      const sel = select.value;
      if (sel) {
        // подставляем текст выбранной опции в ручное поле (автозаполнение)
        manualInput.value = select.options[select.selectedIndex].text;
      }
      // сохраняем в localStorage
      saveToLocal();
    });

    manualInput.addEventListener("input", () => {
      // если пользователь начинает вводить вручную — сбрасываем select
      if (manualInput.value.trim().length > 0) {
        select.value = "";
      }
      saveToLocal();
    });
  }

  function saveToLocal() {
    try {
      const data = {
        carId: select ? select.value || null : null,
        carName: manualInput ? manualInput.value.trim() || null : null
      };
      localStorage.setItem("orderData", JSON.stringify(data));
    } catch (e) {
      // ignore
    }
  }

  function restoreSaved() {
    try {
      const raw = localStorage.getItem("orderData");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.carId && select) select.value = parsed.carId;
      if (parsed.carName && manualInput) manualInput.value = parsed.carName;
    } catch (e) {
      // ignore
    }
  }

  // === Helper: try match manual input to load cars by text ===
  function findCarByText(text) {
    if (!text) return null;
    const t = text.trim().toLowerCase();
    if (!t) return null;
    // match where "brand model" contains the text or vice versa
    const found = allCars.find(c => {
      const key = `${c.brand} ${c.model}`.toLowerCase();
      return key === t || key.includes(t) || t.includes(key);
    });
    return found || null;
  }

  // === Form submit ===
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isSubmitting || isSubmittedSuccessfully) return;

      // collect form values
      const name = (form.elements["name"] && form.elements["name"].value || "").trim();
      const phone = (form.elements["phone"] && form.elements["phone"].value || "").trim();
      const selectVal = select ? select.value : "";
      const manualVal = manualInput ? manualInput.value.trim() : "";

      if (!name || !phone || (!selectVal && !manualVal)) {
        showMessage("❌ Заполните все поля!", true);
        return;
      }

      // determine carId and carName
      let finalCarId = selectVal ? Number(selectVal) : null;
      let finalCarName = manualVal || null;

      // if manual provided but select empty — try to match to loaded list
      if (!finalCarId && manualVal) {
        const matched = findCarByText(manualVal);
        if (matched) {
          finalCarId = matched.id;
          finalCarName = `${matched.brand} ${matched.model}`;
          console.debug("Manual input matched car:", matched);
        } else {
          // not matched — we will still send carName as fallback (server must support it)
          console.debug("Manual input not matched; sending carName:", manualVal);
        }
      }

      const payload = {
        name,
        phone,
        carId: finalCarId !== null ? finalCarId : null,
        carName: finalCarName // optional field, server may ignore
      };

      // disable UI
      isSubmitting = true;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Отправка..."; }
      showMessage("Отправка заявки...");

      try {
        console.debug("POST /orders payload:", payload);
        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "omit"
        });

        // Try to parse response body for diagnostics
        let responseBody = null;
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          responseBody = await res.json();
        } else {
          try { responseBody = await res.text(); } catch (_) { responseBody = null; }
        }

        if (!res.ok) {
          console.error("Server returned error:", res.status, responseBody);
          const detail = responseBody && typeof responseBody === "object" && responseBody.error
                        ? responseBody.error
                        : (responseBody ? JSON.stringify(responseBody) : `HTTP ${res.status}`);
          showMessage("❌ Ошибка сервера: " + detail, true);
          // allow retry
          isSubmitting = false;
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Отправить"; }
          return;
        }

        // success
        console.info("Order submitted successfully:", responseBody);
        showMessage("✅ Заявка успешно отправлена!");
        isSubmittedSuccessfully = true;

        // lock the form completely to prevent another submission until reload
        Array.from(form.elements).forEach(el => el.disabled = true);
        if (submitBtn) submitBtn.textContent = "Отправлено";

        // remove saved selection
        localStorage.removeItem("orderData");
      } catch (err) {
        console.error("Network/JS error sending order:", err);
        showMessage("❌ Ошибка отправки (проверьте соединение).", true);
        isSubmitting = false;
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Отправить"; }
      }
    });
  }

  // start
  loadCars();
});
