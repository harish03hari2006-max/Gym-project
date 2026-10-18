/**
 * js/cart.js
 * Cart drawer logic for index2.html.
 * Imports: api.js, auth.js
 */

import { api }                       from './api.js';
import { isLoggedIn, clearSession }   from './auth.js';

/* ── Cart state (in-memory mirror of server) ─────────────────────────────── */
let cartItems = [];

/* ── Badge element injected into navbar ──────────────────────────────────── */
let badgeEl = null;

/** Initialise: inject cart icon into navbar, attach drawer, load cart */
export async function initCart() {
  injectCartIcon();
  buildDrawer();
  attachBuyNowButtons();

  if (isLoggedIn()) {
    await loadCart();
  }
}

/** Inject cart icon + badge next to the hamburger menu icon in header */
function injectCartIcon() {
  const header = document.querySelector('header');
  if (!header) return;

  // Create wrapper to sit alongside existing nav
  const iconWrap = document.createElement('div');
  iconWrap.id        = 'vf-cart-icon';
  iconWrap.className = 'relative cursor-pointer flex items-center';
  iconWrap.title     = 'Shopping Cart';
  iconWrap.innerHTML = `
    <i class="fa-solid fa-cart-shopping text-amber-400 text-xl"></i>
    <span id="vf-cart-badge" class="absolute -top-2 -right-2 bg-amber-400 text-indigo-950 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center hidden">0</span>
  `;
  iconWrap.addEventListener('click', toggleDrawer);

  // Insert before the mobile hamburger div (last child of header)
  header.insertBefore(iconWrap, header.lastElementChild);
  badgeEl = iconWrap.querySelector('#vf-cart-badge');
}

/** Build the slide-in cart drawer (appended to body) */
function buildDrawer() {
  const drawer = document.createElement('div');
  drawer.id        = 'vf-cart-drawer';
  // Tailwind classes matching existing palette
  drawer.className = 'fixed top-0 right-0 h-full w-80 bg-indigo-950 shadow-2xl z-[999] transform translate-x-full transition-transform duration-300 flex flex-col';
  drawer.innerHTML = `
    <div class="flex justify-between items-center p-5 border-b border-blue-800">
      <h3 class="text-xl font-bold text-amber-400">Your Cart</h3>
      <button id="vf-cart-close" class="text-gray-300 hover:text-amber-400 text-2xl">&times;</button>
    </div>
    <div id="vf-cart-items" class="flex-1 overflow-y-auto p-5 space-y-4 text-gray-100"></div>
    <div class="p-5 border-t border-blue-800">
      <div class="flex justify-between mb-4 text-gray-100 font-semibold">
        <span>Total</span>
        <span id="vf-cart-total">₹0</span>
      </div>
      <button id="vf-cart-checkout" class="w-full py-3 bg-amber-400 text-indigo-950 font-bold rounded-full hover:bg-amber-500 hover:scale-105 transition">Checkout</button>
      <p id="vf-cart-msg" class="mt-2 text-sm text-center text-cyan-300"></p>
    </div>
  `;
  document.body.appendChild(drawer);

  drawer.querySelector('#vf-cart-close').addEventListener('click', closeDrawer);
  drawer.querySelector('#vf-cart-checkout').addEventListener('click', handleCheckout);
}

function openDrawer()  { document.getElementById('vf-cart-drawer')?.classList.replace('translate-x-full', 'translate-x-0'); }
function closeDrawer() { document.getElementById('vf-cart-drawer')?.classList.replace('translate-x-0',    'translate-x-full'); }
function toggleDrawer(){ document.getElementById('vf-cart-drawer')?.classList.toggle('translate-x-full'); document.getElementById('vf-cart-drawer')?.classList.toggle('translate-x-0'); }

/** Fetch cart from backend and re-render */
async function loadCart() {
  try {
    cartItems = await api.cart.get();
    renderCart();
  } catch {
    clearSession();
  }
}

/** Render cart items inside drawer */
function renderCart() {
  const container = document.getElementById('vf-cart-items');
  const totalEl   = document.getElementById('vf-cart-total');
  if (!container) return;

  if (!cartItems.length) {
    container.innerHTML = '<p class="text-gray-400 text-center mt-10">Your cart is empty.</p>';
    totalEl.textContent = '₹0';
    updateBadge(0);
    return;
  }

  container.innerHTML = cartItems.map(item => `
    <div class="flex items-center gap-3 bg-indigo-800 rounded-lg p-3" data-id="${item.product._id}">
      ${item.product.image ? `<img src="${item.product.image}" alt="${item.product.name}" class="w-14 h-14 object-cover rounded">` : '<div class="w-14 h-14 bg-blue-900 rounded flex items-center justify-center"><i class="fa-solid fa-dumbbell text-cyan-400"></i></div>'}
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-cyan-300 truncate">${item.product.name}</p>
        <p class="text-xs text-gray-300">₹${item.product.price} × ${item.quantity}</p>
      </div>
      <div class="flex items-center gap-1">
        <button class="vf-qty-dec px-2 py-1 bg-blue-900 rounded text-xs hover:bg-amber-400 hover:text-indigo-950 transition" data-id="${item.product._id}">−</button>
        <span class="text-sm w-5 text-center">${item.quantity}</span>
        <button class="vf-qty-inc px-2 py-1 bg-blue-900 rounded text-xs hover:bg-amber-400 hover:text-indigo-950 transition" data-id="${item.product._id}">+</button>
        <button class="vf-remove ml-1 text-red-400 hover:text-red-300 text-sm" data-id="${item.product._id}">✕</button>
      </div>
    </div>
  `).join('');

  const total = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
  updateBadge(cartItems.reduce((s, i) => s + i.quantity, 0));

  // Quantity/remove events
  container.querySelectorAll('.vf-qty-dec').forEach(btn =>
    btn.addEventListener('click', () => changeQty(btn.dataset.id, -1)));
  container.querySelectorAll('.vf-qty-inc').forEach(btn =>
    btn.addEventListener('click', () => changeQty(btn.dataset.id, +1)));
  container.querySelectorAll('.vf-remove').forEach(btn =>
    btn.addEventListener('click', () => removeItem(btn.dataset.id)));
}

function updateBadge(count) {
  if (!badgeEl) return;
  badgeEl.textContent = count;
  count > 0 ? badgeEl.classList.remove('hidden') : badgeEl.classList.add('hidden');
}

async function changeQty(productId, delta) {
  const item = cartItems.find(i => i.product._id === productId);
  if (!item) return;
  const newQty = item.quantity + delta;
  try {
    cartItems = await api.cart.update(productId, newQty);
    renderCart();
  } catch (e) { showMsg(e.message, true); }
}

async function removeItem(productId) {
  try {
    cartItems = await api.cart.remove(productId);
    renderCart();
  } catch (e) { showMsg(e.message, true); }
}

/** Wire all "Buy Now" buttons to add product to cart */
function attachBuyNowButtons() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const isBuyBtn = btn.hasAttribute('data-buy-btn') || btn.textContent.trim() === 'Buy Now';
    if (!isBuyBtn) return;
    e.preventDefault();

    if (!isLoggedIn()) {
      window.location.href = 'login.html?redirect=index2.html';
      return;
    }

    let productId = btn.dataset.productId;
    if (!productId) {
      const card = btn.closest('.bg-indigo-800');
      const title = card?.querySelector('h4')?.textContent?.trim();
      if (title) {
        try {
          const list = await api.products.list('whey');
          const matched = list.find(p => p.name.toLowerCase() === title.toLowerCase());
          if (matched) productId = matched._id;
        } catch {}
      }
    }
    if (!productId) {
      showMsg('Product information unavailable', true);
      return;
    }

    const originalText = btn.textContent;
    btn.disabled    = true;
    btn.textContent = 'Adding…';
    try {
      cartItems = await api.cart.add(productId);
      renderCart();
      openDrawer();
      btn.textContent = 'Added!';
      setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 1500);
    } catch (err) {
      btn.textContent = originalText;
      btn.disabled    = false;
      showMsg(err.message, true);
    }
  });
}

async function handleCheckout() {
  if (!isLoggedIn()) { window.location.href = 'login.html?redirect=index2.html'; return; }
  if (!cartItems.length) { showMsg('Your cart is empty!', true); return; }

  try {
    const msg = document.getElementById('vf-cart-msg');
    if (msg) { msg.textContent = 'Placing order…'; msg.classList.remove('hidden'); }
    await api.orders.create({});
    cartItems = [];
    renderCart();
    showMsg('✅ Order placed successfully!', false);
  } catch (err) {
    showMsg(err.message, true);
  }
}

function showMsg(text, isError) {
  const el = document.getElementById('vf-cart-msg');
  if (!el) return;
  el.textContent = text;
  el.className   = `mt-2 text-sm text-center ${isError ? 'text-red-400' : 'text-cyan-300'}`;
}
