// Shopping cart — localStorage-based, Telegram checkout

const CART_KEY = 'kinezis_cart';

// Cross-sell map: which accessories to show for each category/product
const CROSS_SELL = {
  mtb: ['mtb10', 'mtb12', 'acc-handles', 'acc-carabiner', 'mtb13'],
  benches: ['mtb10', 'acc-handles', 'acc-carabiner'],
  bars: ['mtb10', 'acc-handles'],
  stairs: ['mtb10', 'acc-handles'],
  massage: [],
  accessories: ['mtb1', 'mtb2', 'mtb4'],
};

// ── Cart data ────────────────────────────────────────────────────────────────

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(id, name, price) {
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  saveCart(cart);
  updateCartBadge();
  showCartNotification(name);
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
  updateCartBadge();
  renderCartPanel();
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  updateCartBadge();
  renderCartPanel();
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

function cartTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

// ── Badge ────────────────────────────────────────────────────────────────────

function updateCartBadge() {
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// ── Notification ─────────────────────────────────────────────────────────────

function showCartNotification(name) {
  let n = document.getElementById('cartNotif');
  if (!n) {
    n = document.createElement('div');
    n.id = 'cartNotif';
    n.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--teal);color:#fff;padding:12px 24px;border-radius:40px;font-size:14px;font-weight:600;z-index:10000;box-shadow:0 4px 20px rgba(0,0,0,.2);transition:opacity .3s;white-space:normal;word-break:break-word;max-width:min(90vw,400px);text-align:center';
    document.body.appendChild(n);
  }
  const short = name.length > 40 ? name.slice(0, 40) + '...' : name;
  n.textContent = 'Додано до кошика: ' + short;
  n.style.opacity = '1';
  clearTimeout(n._t);
  n._t = setTimeout(() => { n.style.opacity = '0'; }, 2500);
}

// ── Panel ────────────────────────────────────────────────────────────────────

function openCart() {
  const panel = document.getElementById('cartPanel');
  if (panel) { renderCartPanel(); panel.classList.add('open'); document.body.classList.add('cart-open'); }
}

function closeCart() {
  const panel = document.getElementById('cartPanel');
  if (panel) { panel.classList.remove('open'); document.body.classList.remove('cart-open'); }
}

function renderCartPanel() {
  const body = document.getElementById('cartPanelBody');
  if (!body) return;
  const cart = getCart();
  if (cart.length === 0) {
    body.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--muted)"><div style="font-size:48px;margin-bottom:12px">&#128722;</div><p>Кошик порожній</p><a href="catalog" class="btn btn--primary" onclick="closeCart()" style="margin-top:12px;display:inline-block">Перейти до каталогу</a></div>';
    document.getElementById('cartCheckoutBtn').style.display = 'none';
    document.getElementById('cartTotal').style.display = 'none';
    return;
  }
  body.innerHTML = cart.map(function(item) {
    return '<div class="cart-item" data-id="' + item.id + '">' +
      '<div class="cart-item__name">' + item.name + '</div>' +
      '<div class="cart-item__row">' +
        '<div class="cart-item__qty">' +
          '<button onclick="changeQty(\'' + item.id + '\',-1)">&#8722;</button>' +
          '<span>' + item.qty + '</span>' +
          '<button onclick="changeQty(\'' + item.id + '\',+1)">+</button>' +
        '</div>' +
        '<div class="cart-item__price">' + formatPrice(item.price * item.qty) + '</div>' +
        '<button class="cart-item__remove" onclick="removeFromCart(\'' + item.id + '\')" title="Видалити">&times;</button>' +
      '</div>' +
    '</div>';
  }).join('');
  const total = document.getElementById('cartTotal');
  const btn = document.getElementById('cartCheckoutBtn');
  total.style.display = 'flex';
  total.innerHTML = '<span>Разом:</span><span>' + formatPrice(cartTotal()) + '</span>';
  btn.style.display = 'block';
}

function checkoutViaTelegram() {
  const cart = getCart();
  if (!cart.length) return;
  const lines = cart.map(function(i) {
    return i.name + ' x' + i.qty + ' = ' + (i.price * i.qty).toLocaleString('uk-UA') + ' грн';
  }).join('\n');
  const total = cartTotal().toLocaleString('uk-UA');
  const text = encodeURIComponent('Привіт! Хочу замовити:\n\n' + lines + '\n\nРазом: ' + total + ' грн');
  const url = 'https://t.me/Kineziss_bot?text=' + text;
  // Use <a> click instead of window.open — avoids mobile popup blockers (iOS Safari, Android Chrome)
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ── Init ─────────────────────────────────────────────────────────────────────

function initCart() {
  const headerInner = document.querySelector('.header__inner');
  if (headerInner) {
    const btn = document.createElement('button');
    btn.className = 'cart-btn';
    btn.id = 'cartBtn';
    btn.setAttribute('aria-label', 'Кошик');
    btn.onclick = openCart;
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><span id="cartBadge" class="cart-badge" style="display:none">0</span>';
    const cta = headerInner.querySelector('.header__cta');
    if (cta) cta.before(btn); else headerInner.appendChild(btn);
  }

  const panel = document.createElement('div');
  panel.id = 'cartPanel';
  panel.className = 'cart-panel';
  panel.innerHTML =
    '<div class="cart-panel__overlay" onclick="closeCart()"></div>' +
    '<div class="cart-panel__drawer">' +
      '<div class="cart-panel__header">' +
        '<h3>Кошик</h3>' +
        '<button onclick="closeCart()" class="cart-panel__close">&times;</button>' +
      '</div>' +
      '<div id="cartPanelBody" class="cart-panel__body"></div>' +
      '<div class="cart-panel__footer">' +
        '<div id="cartTotal" class="cart-panel__total" style="display:none"></div>' +
        '<button id="cartCheckoutBtn" class="btn btn--primary btn--full btn--lg" onclick="checkoutViaTelegram()" style="display:none">Оформити через Telegram</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(panel);

  updateCartBadge();
}

document.addEventListener('DOMContentLoaded', initCart);

// ── Cross-sell ───────────────────────────────────────────────────────────────

function renderCrossSell(currentProduct) {
  if (typeof products === 'undefined') return;
  const ids = CROSS_SELL[currentProduct.category] || [];
  const items = ids.map(function(id) { return products.find(function(p) { return p.id === id; }); })
    .filter(function(p) { return p && p.id !== currentProduct.id; })
    .slice(0, 4);
  if (!items.length) return;

  const section = document.createElement('section');
  section.className = 'section';
  section.innerHTML =
    '<div class="container">' +
      '<div class="section__head">' +
        '<span class="section__label">Також купують</span>' +
        '<h2 class="section__title">З цим товаром замовляють</h2>' +
      '</div>' +
      '<div class="products__grid" id="crossSellGrid"></div>' +
    '</div>';

  const relatedSection = document.querySelector('.section--tinted');
  if (relatedSection) relatedSection.before(section);
  else document.querySelector('footer').before(section);

  document.getElementById('crossSellGrid').innerHTML = items.map(function(p) {
    var name = p.name.replace(/'/g, "\\'");
    return '<div class="product-card" data-id="' + p.id + '">' +
      (p.badge ? '<div class="product-card__badge">' + p.badge + '</div>' : '') +
      '<div class="product-card__img"><img src="' + p.image + '" alt="' + p.name + '" loading="lazy"/></div>' +
      '<div class="product-card__body">' +
        '<div class="product-card__name">' + p.name + '</div>' +
        '<div class="product-card__short">' + p.short + '</div>' +
        '<div class="product-card__footer">' +
          '<div class="product-card__price">' + formatPrice(p.price) + '</div>' +
          '<div class="product-card__actions">' +
            '<a href="products/' + p.id + '" class="btn btn--outline btn--sm">Детальніше</a>' +
            '<button class="btn btn--primary btn--sm" onclick="addToCart(\'' + p.id + '\',\'' + name + '\',' + p.price + ')">В кошик</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}
