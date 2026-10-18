/**
 * js/main.js
 * Entry point for index2.html backend integration.
 * Loads products, workout plans, testimonials from API,
 * updates static HTML in-place without changing any styling.
 */

import { api }              from './api.js';
import { isLoggedIn, getUser, clearSession } from './auth.js';
import { initCart }         from './cart.js';

document.addEventListener('DOMContentLoaded', async () => {

  /* ── Auth navbar link ──────────────────────────────────────────────────── */
  updateNavAuth();

  /* ── Initialise cart ───────────────────────────────────────────────────── */
  await initCart();

  /* ── Load data from backend ────────────────────────────────────────────── */
  await Promise.allSettled([
    loadWheyProducts(),
    loadEquipment(),
    loadSubliminal(),
    loadWorkoutPlans(),
    loadTestimonials()
  ]);

  /* ── Wire Hero "Join Now" button ───────────────────────────────────────── */
  document.querySelector('#home button')?.addEventListener('click', () => {
    if (isLoggedIn()) {
      document.getElementById('plan')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = 'login.html?redirect=index2.html';
    }
  });

  /* ── Wire "Join the Community" button ─────────────────────────────────── */
  document.querySelector('section.bg-indigo-950.text-center button')?.addEventListener('click', () => {
    if (isLoggedIn()) {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = 'register.html';
    }
  });

  /* ── Wire Contact "Get Started" button → show inline form ─────────────── */
  setupContactSection();

  /* ── Wire Subliminal "Listen Now" / "Start Session" / "Explore" buttons ─ */
  wireSubliminalButtons();
});

/* ────────────────────────────────────────────────────────────────────────────
   NAVBAR AUTH
   - For Admin: Home, Workouts, Plans, Contact are hidden; shows Hi, Admin | Admin | Logout.
   - For Member: Home, Workouts, Plans, Contact + Hi, [Name] | Logout.
   - For Guest: Home, Workouts, Plans, Contact + Login.
──────────────────────────────────────────────────────────────────────────── */
function updateNavAuth() {
  const nav = document.querySelector('header nav.hidden.md\\:flex');
  if (!nav) return;

  // Remove any previously injected auth elements
  nav.querySelectorAll('[data-vf-auth]').forEach(el => el.remove());

  // Base links: Home, Workouts, Plans, Contact
  const baseLinks = nav.querySelectorAll('a[href^="#"]');

  if (isLoggedIn()) {
    const user = getUser();

    if (user?.role === 'admin') {
      // Hide Home, Workouts, Plans, Contact for admin
      baseLinks.forEach(a => a.classList.add('hidden'));

      const greeting = document.createElement('span');
      greeting.setAttribute('data-vf-auth', '1');
      greeting.className = 'text-amber-400 font-semibold cursor-default';
      greeting.textContent = 'Hi, Admin';
      nav.appendChild(greeting);

      const adminLink = document.createElement('a');
      adminLink.setAttribute('data-vf-auth', '1');
      adminLink.href = 'admin.html';
      adminLink.className = 'hover:text-amber-400 hover:underline';
      adminLink.textContent = 'Admin';
      nav.appendChild(adminLink);

      const logoutLink = document.createElement('a');
      logoutLink.setAttribute('data-vf-auth', '1');
      logoutLink.href = '#';
      logoutLink.className = 'hover:text-amber-400 hover:underline';
      logoutLink.textContent = 'Logout';
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        clearSession();
        location.reload();
      });
      nav.appendChild(logoutLink);
    } else {
      // Normal member: keep base links + member greeting + Logout
      baseLinks.forEach(a => a.classList.remove('hidden'));

      const memberGreeting = document.createElement('span');
      memberGreeting.setAttribute('data-vf-auth', '1');
      memberGreeting.className = 'text-amber-400 font-semibold cursor-default';
      memberGreeting.textContent = `Hi, ${user?.name?.split(' ')[0] || 'Member'}`;
      nav.appendChild(memberGreeting);

      const logoutLink = document.createElement('a');
      logoutLink.setAttribute('data-vf-auth', '1');
      logoutLink.href = '#';
      logoutLink.className = 'hover:text-amber-400 hover:underline';
      logoutLink.textContent = 'Logout';
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        clearSession();
        location.reload();
      });
      nav.appendChild(logoutLink);
    }
  } else {
    // Guest: show base links + Login
    baseLinks.forEach(a => a.classList.remove('hidden'));

    const loginLink = document.createElement('a');
    loginLink.setAttribute('data-vf-auth', '1');
    loginLink.href = 'login.html';
    loginLink.className = 'hover:text-amber-400 hover:underline';
    loginLink.textContent = 'Login';
    nav.appendChild(loginLink);
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   WHEY PROTEINS  – replace static product cards with DB data
──────────────────────────────────────────────────────────────────────────── */
async function loadWheyProducts() {
  try {
    const products = await api.products.list('whey');
    const grid = document.querySelector('#whey-protein .grid');
    if (!grid || !products.length) return;

    grid.innerHTML = products.map(p => `
      <div class="bg-indigo-800 rounded-xl shadow-lg overflow-hidden hover:scale-105 transition">
        <img src="${p.image}" alt="${p.name}" class="w-full h-48 object-cover" />
        <div class="p-5">
          <h4 class="text-xl font-bold text-cyan-300 mb-2">${p.name}</h4>
          <p class="text-sm text-gray-200">${p.description}</p>
          <button
            data-buy-btn="1"
            data-product-id="${p._id}"
            class="mt-4 px-4 py-2 bg-amber-400 text-indigo-950 font-semibold rounded hover:bg-amber-500">Buy Now</button>
        </div>
      </div>
    `).join('');
  } catch { /* keep static HTML if API fails */ }
}

/* ────────────────────────────────────────────────────────────────────────────
   EQUIPMENT  – replace static equipment cards with DB data
──────────────────────────────────────────────────────────────────────────── */
async function loadEquipment() {
  try {
    const products = await api.products.list('equipment');
    const grid = document.querySelector('#equipments .grid');
    if (!grid || !products.length) return;

    grid.innerHTML = products.map(p => `
      <div class="bg-indigo-800 p-5 rounded-xl shadow hover:scale-105 transition">
        <img src="${p.image}" alt="${p.name}" class="w-full h-44 object-cover rounded mb-4">
        <h4 class="text-lg font-bold text-cyan-300">${p.name}</h4>
        <p class="text-sm text-gray-300">${p.description}</p>
      </div>
    `).join('');
  } catch { /* keep static HTML if API fails */ }
}

/* ────────────────────────────────────────────────────────────────────────────
   SUBLIMINAL BOOSTS  – replace static subliminal cards with DB data
──────────────────────────────────────────────────────────────────────────── */
async function loadSubliminal() {
  try {
    const products = await api.products.list('subliminal');
    const grid = document.querySelector('#subliminal .grid');
    if (!grid || !products.length) return;

    grid.innerHTML = products.map((p, idx) => {
      const btnText = idx === 0 ? 'Listen Now' : idx === 1 ? 'Start Session' : 'Explore Audios';
      return `
        <div class="bg-indigo-800 rounded-xl shadow-lg p-6 hover:scale-105 transition">
          <h4 class="text-xl font-bold text-cyan-300 mb-3">${p.name}</h4>
          <p class="text-gray-200">${p.description}</p>
          <button class="mt-4 px-4 py-2 bg-amber-400 text-indigo-950 font-semibold rounded hover:bg-amber-500">${btnText}</button>
        </div>
      `;
    }).join('');
    wireSubliminalButtons();
  } catch { /* keep static HTML if API fails */ }
}

/* ────────────────────────────────────────────────────────────────────────────
   WORKOUT PLANS  – replace static plan cards with DB data
──────────────────────────────────────────────────────────────────────────── */
async function loadWorkoutPlans() {
  try {
    const plans = await api.plans.list();
    const grid  = document.querySelector('#plan .flex.flex-wrap');
    if (!grid || !plans.length) return;

    grid.innerHTML = plans.map(pl => `
      <div class="bg-indigo-800 p-6 rounded-lg w-full md:w-1/3 hover:scale-105 transition">
        <h4 class="text-xl font-bold text-cyan-300 mb-3">${pl.title}</h4>
        <p>${pl.description}</p>
      </div>
    `).join('');
  } catch { /* keep static HTML if API fails */ }
}

/* ────────────────────────────────────────────────────────────────────────────
   TESTIMONIALS  – replace static testimonials with DB data
──────────────────────────────────────────────────────────────────────────── */
async function loadTestimonials() {
  try {
    const testimonials = await api.testimonials.list();
    const flex         = document.querySelector('section.py-20.bg-blue-900.px-6 .flex.flex-wrap');
    if (!flex || !testimonials.length) return;

    flex.innerHTML = testimonials.map(t => `
      <div class="bg-indigo-800 p-6 rounded-lg w-full md:w-2/5 hover:scale-105 transition">
        <p class="italic text-gray-200">${t.content}</p>
        <p class="mt-4 font-bold text-cyan-300">– ${t.author}, ${t.date}</p>
      </div>
    `).join('');
  } catch { /* keep static HTML */ }
}

/* ────────────────────────────────────────────────────────────────────────────
   CONTACT SECTION
   Transforms the existing "Get Started" button to reveal a small inline form
   without adding any new section or redesigning the existing one.
──────────────────────────────────────────────────────────────────────────── */
function setupContactSection() {
  const section = document.getElementById('contact');
  if (!section) return;

  const btn = section.querySelector('button');
  if (!btn) return;

  // Build inline form (hidden by default)
  const form = document.createElement('form');
  form.id        = 'vf-contact-form';
  form.className = 'mt-6 flex flex-col items-center gap-3 hidden';
  form.innerHTML = `
    <input id="vf-contact-name"    type="text"  placeholder="Your Name"    required
      class="w-full max-w-sm px-4 py-2 rounded bg-indigo-900 border border-blue-700 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400" />
    <input id="vf-contact-email"   type="email" placeholder="Your Email"   required
      class="w-full max-w-sm px-4 py-2 rounded bg-indigo-900 border border-blue-700 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400" />
    <textarea id="vf-contact-msg"  placeholder="Your Message" rows="3" required
      class="w-full max-w-sm px-4 py-2 rounded bg-indigo-900 border border-blue-700 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"></textarea>
    <button type="submit"
      class="bg-white text-indigo-800 font-bold py-2 px-6 rounded hover:bg-gray-200 hover:scale-105 transition">
      Send Message
    </button>
    <p id="vf-contact-resp" class="text-sm text-indigo-900 font-semibold hidden"></p>
  `;
  btn.parentElement.appendChild(form);

  // Toggle form on "Get Started" click
  btn.addEventListener('click', () => {
    form.classList.toggle('hidden');
    btn.textContent = form.classList.contains('hidden') ? 'Get Started' : 'Close';
  });

  // Submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type=submit]');
    const resp      = document.getElementById('vf-contact-resp');

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';

    try {
      const result = await api.contact.send({
        name:    document.getElementById('vf-contact-name').value.trim(),
        email:   document.getElementById('vf-contact-email').value.trim(),
        message: document.getElementById('vf-contact-msg').value.trim()
      });
      resp.textContent = result.message;
      resp.className   = 'text-sm text-indigo-900 font-semibold';
      resp.classList.remove('hidden');
      form.reset();
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled    = false;
    } catch (err) {
      resp.textContent = err.message;
      resp.className   = 'text-sm text-red-700 font-semibold';
      resp.classList.remove('hidden');
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled    = false;
    }
  });
}

/* ────────────────────────────────────────────────────────────────────────────
   SUBLIMINAL BUTTONS
   Route to login if not logged in, otherwise show a toast-style note.
──────────────────────────────────────────────────────────────────────────── */
function wireSubliminalButtons() {
  const section = document.getElementById('subliminal');
  if (!section) return;

  section.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!isLoggedIn()) {
        window.location.href = 'login.html?redirect=index2.html#subliminal';
        return;
      }
      const orig = btn.textContent;
      btn.textContent = '✅ Feature coming soon!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  });
}
