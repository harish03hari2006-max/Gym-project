/**
 * js/api.js
 * Centralised API client for Vitaflex frontend.
 * All fetch calls go through here — no credentials hardcoded.
 */

const API_BASE = 'http://localhost:5000/api';

/** Return auth headers if a token is stored */
function authHeaders() {
  const token = localStorage.getItem('vf_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Generic request helper */
async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() }
  };
  if (body) opts.body = JSON.stringify(body);

  const res  = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  delete: (path)        => request('DELETE', path),

  // Convenience wrappers
  auth: {
    register: (data)  => request('POST', '/auth/register', data),
    login:    (data)  => request('POST', '/auth/login',    data),
    me:       ()      => request('GET',  '/auth/me')
  },
  products: {
    list:    (cat)    => request('GET',  cat ? `/products?category=${cat}` : '/products'),
    get:     (id)     => request('GET',  `/products/${id}`),
    create:  (data)   => request('POST', '/products', data),
    update:  (id, d)  => request('PUT',  `/products/${id}`, d),
    remove:  (id)     => request('DELETE', `/products/${id}`)
  },
  plans: {
    list:   ()        => request('GET',  '/plans'),
    get:    (id)      => request('GET',  `/plans/${id}`),
    create: (data)    => request('POST', '/plans', data),
    update: (id, d)   => request('PUT',  `/plans/${id}`, d),
    remove: (id)      => request('DELETE', `/plans/${id}`)
  },
  cart: {
    get:    ()            => request('GET',    '/cart'),
    add:    (productId, quantity = 1) => request('POST', '/cart', { productId, quantity }),
    update: (productId, quantity)     => request('PUT',  `/cart/${productId}`, { quantity }),
    remove: (productId)               => request('DELETE', `/cart/${productId}`),
    clear:  ()            => request('DELETE', '/cart')
  },
  orders: {
    create:  (address) => request('POST', '/orders', { address }),
    my:      ()        => request('GET',  '/orders/my'),
    all:     ()        => request('GET',  '/orders'),
    setStatus: (id, status) => request('PUT', `/orders/${id}/status`, { status })
  },
  contact: {
    send:   (data)    => request('POST', '/contact', data),
    list:   ()        => request('GET',  '/contact'),
    remove: (id)      => request('DELETE', `/contact/${id}`)
  },
  testimonials: {
    list:    ()       => request('GET',  '/testimonials'),
    all:     ()       => request('GET',  '/testimonials/all'),
    submit:  (data)   => request('POST', '/testimonials', data),
    update:  (id, d)  => request('PUT',  `/testimonials/${id}`, d),
    remove:  (id)     => request('DELETE', `/testimonials/${id}`)
  },
  admin: {
    stats:       ()   => request('GET',    '/admin/stats'),
    users:       ()   => request('GET',    '/admin/users'),
    deleteUser:  (id) => request('DELETE', `/admin/users/${id}`)
  }
};
