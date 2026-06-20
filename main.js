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
            <a href="product.html?id=${p.id}" class="btn btn--outline btn--sm">Детальніше</a>
            <button class="btn btn--primary btn--sm" onclick="orderOnTelegram('${p.id}', '${p.name.replace(/'/g, "\\'")}')">Замовити</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
