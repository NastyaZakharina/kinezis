// Main JS for all pages

// Header scroll shadow
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });
}

// Burger menu
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
if (burger && nav) {
  function closeNav() {
    nav.classList.remove('open');
    burger.classList.remove('open');
    document.body.classList.remove('nav-open');
  }
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    if (isOpen) { closeNav(); } else {
      nav.classList.add('open');
      burger.classList.add('open');
      document.body.classList.add('nav-open');
    }
  });
  nav.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', closeNav));
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) closeNav();
  });
}

// Active nav link
document.querySelectorAll('.nav__link').forEach(link => {
  if (link.href === location.href) link.classList.add('active');
  else link.classList.remove('active');
});

// Featured products on homepage
const featuredGrid = document.getElementById('featuredGrid');
if (featuredGrid && typeof products !== 'undefined') {
  const featured = products.filter(p => p.featured);
  featuredGrid.innerHTML = featured.map(p => productCardHTML(p)).join('');
}

function productCardHTML(p) {
  return `
    <div class="product-card" data-id="${p.id}">
      <a href="products/${p.id}" class="product-card__stretched-link" aria-label="${p.name.replace(/"/g,'&quot;')}"></a>
      ${p.badge ? `<div class="product-card__badge">${p.badge}</div>` : ''}
      <div class="product-card__img">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="product-card__body">
        <div class="product-card__name">${p.name}</div>
        <div class="product-card__short">${p.short}</div>
        <div class="product-card__footer">
          <div class="product-card__price">
            ${formatPrice(p.price)}
          </div>
          <div class="product-card__actions">
            <a href="products/${p.id}" class="btn btn--outline btn--sm">Детальніше</a>
            <button class="btn btn--primary btn--sm" onclick="addToCart('${p.id}','${p.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'")}',${p.price})">В кошик</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Breadcrumb JSON-LD (schema.org) — auto-generated from .breadcrumb div
(function() {
  const bc = document.querySelector('.breadcrumb');
  if (!bc) return;
  const links = bc.querySelectorAll('a');
  const spans = bc.querySelectorAll('span:last-child');
  const items = [];
  links.forEach((a, i) => {
    items.push({ '@type': 'ListItem', position: i + 1, name: a.textContent.trim(), item: a.href });
  });
  const lastSpan = bc.querySelector('span:last-of-type');
  if (lastSpan) {
    items.push({ '@type': 'ListItem', position: items.length + 1, name: lastSpan.textContent.trim() });
  }
  if (items.length < 2) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items });
  document.head.appendChild(script);
})();

// Related products card HTML (used in all product pages)
function relatedCardHTML(q) {
  var price = q.price ? q.price.toLocaleString('uk-UA') + ' грн' : '';
  var safeName = (q.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return '<div class="product-card" data-id="' + q.id + '">' +
    '<a href="' + q.id + '" class="product-card__stretched-link" aria-label="' + (q.name || '').replace(/"/g, '&quot;') + '"></a>' +
    (q.badge ? '<div class="product-card__badge">' + q.badge + '</div>' : '') +
    '<div class="product-card__img"><img src="../' + q.image + '" alt="' + (q.name || '') + '" loading="lazy"/></div>' +
    '<div class="product-card__body">' +
    '<div class="product-card__name">' + (q.name || '') + '</div>' +
    '<div class="product-card__short">' + (q.short || '') + '</div>' +
    '<div class="product-card__footer">' +
    '<div class="product-card__price">' + price + '</div>' +
    '<div class="product-card__actions">' +
    '<a href="' + q.id + '" class="btn btn--outline btn--sm">Детальніше</a>' +
    '<button class="btn btn--primary btn--sm" onclick="addToCart(\'' + q.id + '\',\'' + safeName + '\',' + q.price + ')">В кошик</button>' +
    '</div></div></div></div>';
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Callback modal + form (all product pages)
document.addEventListener('DOMContentLoaded', function() {
  const callbackModal = document.getElementById('callbackModal');
  const callbackClose = document.getElementById('callbackClose');
  const callbackForm  = document.getElementById('callbackForm');
  if (!callbackModal) return;

  // Replace "Замовити дзвінок" button with phone link
  document.querySelectorAll('[onclick*="showCallbackModal"]').forEach(function(btn) {
    const phoneLink = document.createElement('a');
    phoneLink.href = 'tel:+380992662688';
    phoneLink.className = btn.className;
    phoneLink.style.cssText = 'text-align:center;text-decoration:none;justify-content:center';
    phoneLink.innerHTML = '📞 +38 (099) 266-26-88';
    btn.parentNode.replaceChild(phoneLink, btn);
  });

  // Also keep window.showCallbackModal working (used elsewhere)
  window.showCallbackModal = function() {
    callbackModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  if (callbackClose) {
    callbackClose.addEventListener('click', function() {
      callbackModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
  callbackModal.addEventListener('click', function(e) {
    if (e.target === callbackModal) {
      callbackModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Submit form via Cloudflare Worker
  if (callbackForm) {
    callbackForm.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const name    = (document.getElementById('callbackName')    || {}).value || '';
      const phone   = (document.getElementById('callbackPhone')   || {}).value || '';
      const product = (document.getElementById('callbackProduct') || {}).value || '';
      const btn = document.getElementById('callbackSubmitBtn');
      const msg = document.getElementById('callbackMsg');
      if (btn) { btn.disabled = true; btn.textContent = 'Надсилаємо...'; }
      fetch('https://kinezis-bot.nastiazaharina.workers.dev/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, product, message: '📞 Замовлення дзвінка' }),
        keepalive: true
      }).then(function(r) { return r.json(); }).then(function() {
        window.location.href = '/thank-you.html';
      }).catch(function() {
        if (msg) { msg.style.display = 'block'; msg.style.color = '#dc2626'; msg.textContent = '❌ Помилка. Зателефонуйте: +38 (099) 266-26-88'; }
        if (btn) { btn.disabled = false; btn.textContent = '📞 Передзвоніть мені'; }
      });
    }, true);
  }
});

/* Speculation Rules — Chrome/Edge prerender same-origin pages when the user
   shows intent (hover / touchstart), so clicking a link opens instantly with
   no white flash or header repaint. Ignored by browsers without support. */
(function () {
  if (!HTMLScriptElement.supports || !HTMLScriptElement.supports('speculationrules')) return;
  var rules = {
    prerender: [{
      where: { and: [
        { href_matches: '/*' },
        { not: { href_matches: '/*\\.(pdf|xml|csv|zip|jpg|jpeg|png|webp)' } },
        { not: { selector_matches: '[href*="/admin"], [href*="/cabinet"], [href*="/login"], [href*="t.me"], [target="_blank"]' } }
      ] },
      eagerness: 'moderate'
    }]
  };
  var s = document.createElement('script');
  s.type = 'speculationrules';
  s.textContent = JSON.stringify(rules);
  document.body.appendChild(s);
})();

/* Promo banner — small non-modal card (bottom corner) with one offer.
   EDIT THE TEXT BELOW to change the offer. Shows once after ~20s or 50% scroll,
   and stays hidden for 14 days after being closed (30 after the button click).
   Preview any time with ?promo=1 in the URL. Never shown on admin/cabinet/login
   pages. Not a full-screen interstitial, so it does not hurt SEO or UX. */
(function () {
  var PROMO = {
    title: 'Не знаєте, який тренажер обрати?',
    text: 'Безкоштовно підберемо під ваш діагноз і бюджет. Напишіть нам у Telegram, відповімо в робочий час.',
    button: 'Отримати підбір',
    href: 'https://t.me/Kineziss_bot',
    delayMs: 20000,
    hideDaysClosed: 14,
    hideDaysClicked: 30
  };
  var KEY = 'kz_promo_hidden_until';
  var path = location.pathname;
  if (/^\/(admin|cabinet|login|thank-you)(\.html)?\/?$/.test(path)) return;
  var force = /[?&]promo=1\b/.test(location.search);

  function store(get, val) {
    try { return get ? localStorage.getItem(KEY) : localStorage.setItem(KEY, val); } catch (e) { return null; }
  }
  if (!force && Number(store(true)) > Date.now()) return;

  var shown = false, el;
  function track(name) {
    try { (window.dataLayer = window.dataLayer || []).push({ event: name, promo_page: path }); } catch (e) {}
  }
  function hideFor(days) { store(false, String(Date.now() + days * 864e5)); }
  function close(days) {
    if (!el) return;
    hideFor(days);
    el.classList.remove('promo-banner--in');
    setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); el = null; }, 300);
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(PROMO.hideDaysClosed); }

  function show() {
    if (shown) return;
    // do not interrupt checkout: cart drawer or a modal is open -> try again later
    var busy = document.querySelector('.cart-panel.open') ||
      Array.prototype.some.call(document.querySelectorAll('.modal-overlay'), function (m) {
        var cs = getComputedStyle(m); // closed modals are opacity:0 + pointer-events:none, not display:none
        return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.pointerEvents !== 'none' && parseFloat(cs.opacity) > 0;
      });
    if (busy) { setTimeout(show, 8000); return; }
    shown = true;
    el = document.createElement('aside');
    el.className = 'promo-banner';
    el.setAttribute('role', 'complementary');
    el.setAttribute('aria-label', 'Пропозиція');
    el.innerHTML =
      '<button type="button" class="promo-banner__close" aria-label="Закрити">&times;</button>' +
      '<strong class="promo-banner__title"></strong>' +
      '<p class="promo-banner__text"></p>' +
      '<a class="btn btn--primary promo-banner__btn" target="_blank" rel="noopener"></a>';
    el.querySelector('.promo-banner__title').textContent = PROMO.title;
    el.querySelector('.promo-banner__text').textContent = PROMO.text;
    var a = el.querySelector('.promo-banner__btn');
    a.textContent = PROMO.button; a.href = PROMO.href;
    a.addEventListener('click', function () { track('promo_banner_click'); close(PROMO.hideDaysClicked); });
    el.querySelector('.promo-banner__close').addEventListener('click', function () { track('promo_banner_close'); close(PROMO.hideDaysClosed); });
    document.body.appendChild(el);
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('promo-banner--in'); }); });
    document.addEventListener('keydown', onKey);
    track('promo_banner_view');
  }

  function onScroll() {
    var h = document.documentElement;
    if ((h.scrollTop + window.innerHeight) / h.scrollHeight > 0.5) { window.removeEventListener('scroll', onScroll); show(); }
  }
  if (force) { setTimeout(show, 600); return; }
  setTimeout(show, PROMO.delayMs);
  window.addEventListener('scroll', onScroll, { passive: true });
})();
