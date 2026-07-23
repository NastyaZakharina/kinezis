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
            <button class="btn btn--primary btn--sm" onclick="addToCart('${p.id}','${p.name.replace(/'/g,"\\'")}',${p.price})">В кошик</button>
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
