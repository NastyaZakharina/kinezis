/**
 * lead-form.js — модальна форма заявки для продуктових сторінок Кінезіс
 * Підключається на кожній сторінці товару: <script src="../lead-form.js"></script>
 */
(function () {
  'use strict';

  var WORKER_URL = 'https://kinezis-bot.nastiazaharina.workers.dev/lead';

  // ── Стилі ──────────────────────────────────────────────────────────────────
  var css = `
#lf-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:none;align-items:center;justify-content:center;padding:16px}
#lf-overlay.open{display:flex}
#lf-box{background:#fff;border-radius:20px;width:100%;max-width:440px;padding:32px 28px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.25)}
#lf-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:22px;cursor:pointer;color:#6b7280;line-height:1}
#lf-close:hover{color:#111}
#lf-title{font-family:'Unbounded',sans-serif;font-size:20px;font-weight:700;margin:0 0 6px;color:#0b2120}
#lf-subtitle{font-size:14px;color:#6b7280;margin:0 0 22px}
#lf-form label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:5px;margin-top:14px}
#lf-form label:first-of-type{margin-top:0}
#lf-form input,#lf-form textarea{width:100%;box-sizing:border-box;border:1.5px solid #d1d5db;border-radius:10px;padding:11px 13px;font-size:15px;font-family:inherit;outline:none;transition:border-color .2s}
#lf-form input:focus,#lf-form textarea:focus{border-color:#1a6b5b}
#lf-form textarea{resize:vertical;min-height:72px}
#lf-error{color:#dc2626;font-size:13px;margin-top:8px;display:none}
#lf-btn{margin-top:20px;width:100%;padding:14px;background:#1a6b5b;color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s}
#lf-btn:hover{background:#155749}
#lf-btn:disabled{background:#9ca3af;cursor:not-allowed}
#lf-tg{margin-top:14px;text-align:center;font-size:13px;color:#6b7280}
#lf-tg a{color:#1a6b5b;font-weight:600;text-decoration:none}
#lf-tg a:hover{text-decoration:underline}
@media(max-width:480px){#lf-box{padding:24px 18px}}
`;

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── HTML модалки ───────────────────────────────────────────────────────────
  var html = `
<div id="lf-overlay" role="dialog" aria-modal="true" aria-labelledby="lf-title">
  <div id="lf-box">
    <button id="lf-close" aria-label="Закрити">&times;</button>
    <p id="lf-title">🛒 Оформлення замовлення</p>
    <p id="lf-subtitle">Залиште контакти — менеджер зателефонує і підтвердить замовлення</p>
    <form id="lf-form" novalidate>
      <label for="lf-name">Ваше ім'я *</label>
      <input id="lf-name" type="text" placeholder="Наприклад: Іван" autocomplete="given-name" required/>
      <label for="lf-phone">Номер телефону *</label>
      <input id="lf-phone" type="tel" placeholder="+38 099 000 00 00" autocomplete="tel" required/>
      <label for="lf-comment">Коментар (необов'язково)</label>
      <textarea id="lf-comment" placeholder="Питання щодо товару, зручний час дзвінка..."></textarea>
      <div id="lf-error">Будь ласка, вкажіть ім'я та номер телефону</div>
      <button id="lf-btn" type="submit">✅ Підтвердити замовлення</button>
    </form>
    <p id="lf-tg">або <a href="https://t.me/Kineziss_bot" target="_blank" rel="noopener">написати в Telegram</a></p>
  </div>
</div>
`;

  var wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap);

  var overlay = document.getElementById('lf-overlay');
  var closeBtn = document.getElementById('lf-close');
  var form     = document.getElementById('lf-form');
  var errDiv   = document.getElementById('lf-error');
  var btn      = document.getElementById('lf-btn');
  var phoneEl  = document.getElementById('lf-phone');

  // Назва товару береться з data-атрибута або title сторінки
  var currentProduct = '';

  function openModal(productName) {
    currentProduct = productName || document.title;
    errDiv.style.display = 'none';
    btn.disabled = false;
    btn.textContent = 'Надіслати заявку';
    form.reset();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { document.getElementById('lf-name').focus(); }, 100);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name  = document.getElementById('lf-name').value.trim();
    var phone = phoneEl.value.trim();

    if (!name || !phone) {
      errDiv.style.display = 'block';
      return;
    }
    errDiv.style.display = 'none';

    btn.disabled = true;
    btn.textContent = 'Надсилаємо…';

    fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        phone: phone,
        page: currentProduct,
        comment: document.getElementById('lf-comment').value.trim(),
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.ok) {
          closeModal();
          window.location.href = '/thank-you';
        } else {
          btn.disabled = false;
          btn.textContent = 'Надіслати заявку';
          errDiv.textContent = 'Помилка. Спробуйте ще раз або напишіть у Telegram.';
          errDiv.style.display = 'block';
        }
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'Надіслати заявку';
        errDiv.textContent = 'Помилка з\'єднання. Напишіть нам у Telegram.';
        errDiv.style.display = 'block';
      });
  });

  // Публічний API
  window.openLeadModal = openModal;

  // Зворотна сумісність: showOrderModal → openLeadModal
  window.showOrderModal = function (pid, pname) {
    openModal(pname || pid);
  };
}());
