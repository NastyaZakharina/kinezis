// auth.js — injects login/cabinet button into header on all pages
// Loaded as a module, reads Firebase auth state

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, serverTimestamp, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { FIREBASE_CONFIG } from './firebase-config.js';

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);

// Make db and auth available globally for other scripts
window.__kinezisAuth = auth;
window.__kinezisDb = db;

onAuthStateChanged(auth, user => {
  injectHeaderBtn(user);
  window.__kinezisUser = user || null;
});

function injectHeaderBtn(user) {
  // Remove existing if re-rendered
  const existing = document.getElementById('headerAuthBtn');
  if (existing) existing.remove();

  const headerInner = document.querySelector('.header__inner');
  if (!headerInner) return;

  const btn = document.createElement('a');
  btn.id = 'headerAuthBtn';

  if (user) {
    const name = user.displayName ? user.displayName.split(' ')[0] : 'Кабінет';
    const initials = (user.displayName || user.email || '?').charAt(0).toUpperCase();
    btn.href = 'cabinet.html';
    btn.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 14px 7px 7px;background:var(--teal-light);border-radius:40px;text-decoration:none;color:var(--teal);font-weight:600;font-size:14px;flex-shrink:0;transition:background .2s';
    btn.innerHTML = user.photoURL
      ? '<img src="' + user.photoURL + '" style="width:30px;height:30px;border-radius:50%;object-fit:cover" alt=""/><span>' + name + '</span>'
      : '<div style="width:30px;height:30px;border-radius:50%;background:var(--teal);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0">' + initials + '</div><span>' + name + '</span>';
  } else {
    btn.href = 'login.html';
    btn.style.cssText = 'display:flex;align-items:center;gap:6px;padding:8px 16px;border:1.5px solid var(--border);border-radius:40px;text-decoration:none;color:var(--body);font-weight:600;font-size:14px;flex-shrink:0;transition:all .2s';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>Увійти';
  }

  // Insert before cart button or CTA
  const cartBtn = document.getElementById('cartBtn');
  const cta = headerInner.querySelector('.header__cta');
  if (cartBtn) cartBtn.before(btn);
  else if (cta) cta.before(btn);
  else headerInner.appendChild(btn);
}

// ── Save order to Firestore ─────────────────────────────────────────────────
// Called from product.html callback form and Telegram order button

window.saveOrderToFirestore = async function(type, product, phone) {
  const user = window.__kinezisUser;
  if (!user) return;
  try {
    await addDoc(collection(db, 'orders'), {
      userId: user.uid,
      type,           // 'callback' | 'telegram'
      product: product || '',
      phone: phone || '',
      status: 'new',
      createdAt: serverTimestamp(),
    });
    // Points are added manually by admin after purchase confirmation
  } catch(e) {
    console.warn('saveOrder:', e);
  }
};

// ── Wishlist helpers ────────────────────────────────────────────────────────

window.toggleWishlist = async function(productId, btn) {
  const user = window.__kinezisUser;
  if (!user) { window.location.href = 'login.html?next=' + encodeURIComponent(location.pathname + location.search); return; }
  if (btn) btn.disabled = true;
  try {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    const list = (snap.exists() && snap.data().wishlist) ? [...snap.data().wishlist] : [];
    const idx = list.indexOf(productId);
    if (idx >= 0) {
      list.splice(idx, 1);
      if (btn) { btn.textContent = '♡ Зберегти'; btn.style.color = ''; }
    } else {
      list.push(productId);
      if (btn) { btn.textContent = '♥ Збережено'; btn.style.color = '#e53e3e'; }
    }
    await setDoc(ref, { wishlist: list }, { merge: true });
  } catch(e) {
    console.error('Wishlist error:', e);
  } finally {
    if (btn) btn.disabled = false;
  }
};

window.isInWishlist = async function(productId) {
  const user = window.__kinezisUser;
  if (!user) return false;
  const snap = await getDoc(doc(db, 'users', user.uid));
  const list = (snap.exists() && snap.data().wishlist) ? snap.data().wishlist : [];
  return list.includes(productId);
};
