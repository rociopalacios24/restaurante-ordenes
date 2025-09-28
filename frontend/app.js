// Cambia esta URL cuando despliegues el backend en Render
const API = (location.hostname === 'localhost')
  ? 'http://localhost:3000'
  : 'https://TU-BACKEND-RENDER.onrender.com';

const qs = (s) => document.querySelector(s);

const state = { cliente: JSON.parse(localStorage.getItem('cliente') || 'null') };

function show(section) {
  qs('#auth').classList.toggle('hidden', section !== 'auth');
  qs('#app').classList.toggle('hidden', section !== 'app');
}

function setCliente(c) {
  state.cliente = c;
  if (c) {
    localStorage.setItem('cliente', JSON.stringify(c));
    qs('#hello').textContent = `Hola, ${c.nombre} (${c.email})`;
    show('app');
    cargarOrdenes();
  } else {
    localStorage.removeItem('cliente');
    show('auth');
  }
}

async function registrar() {
  qs('#reg-msg').textContent = '';
  const body = {
    nombre: qs('#reg-nombre').value.trim(),
    email: qs('#reg-email').value.trim(),
    telefono: qs('#reg-tel').value.trim()
  };
  const res = await fetch(`${API}/clientes/registrar`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) { qs('#reg-msg').textContent = data.error || 'Error'; return; }
  qs('#reg-msg').textContent = 'Cliente registrado. Ahora inicia sesión.';
}

async function login() {
  qs('#log-msg').textContent = '';
  const body = {
    email: qs('#log-email').value.trim(),
    telefono: qs('#log-tel').value.trim()
  };
  const res = await fetch(`${API}/clientes/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) { qs('#log-msg').textContent = data.error || 'Error'; return; }
  setCliente(data);
}

async function crearOrden() {
  qs('#orden-msg').textContent = '';
  const platillo = qs('#orden-platillo').value.trim();
  const notes = qs('#orden-notes').value.trim();
  if (!platillo || !notes) { qs('#orden-msg').textContent = 'Platillo y notas son requeridos'; return; }
  const res = await fetch(`${API}/ordenes`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ cliente_id: state.cliente.id, platillo_nombre: platillo, notes })
  });
  const data = await res.json();
  if (!res.ok) { qs('#orden-msg').textContent = data.error || 'Error'; return; }
  qs('#orden-platillo').value = '';
  qs('#orden-notes').value = '';
  cargarOrdenes();
}

function badge(status) { return `<span class="status">${status}</span>`; }

async function cargarOrdenes() {
  const res = await fetch(`${API}/ordenes/${state.cliente.id}`);
  const ordenes = await res.json();
  const ul = qs('#ordenes-list');
  ul.innerHTML = '';
  ordenes.forEach(o => {
    const li = document.createElement('li');
    li.className = 'orden';
    li.innerHTML = `
      <div>
        ${badge(o.estado)} <strong>${o.platillo_nombre}</strong><br/>
        <small>Notas: ${o.notes}</small><br/>
        <small>id #${o.id} · ${new Date(o.created).toLocaleString()}</small>
      </div>
      <div>
        <button data-id="${o.id}" class="advance">Avanzar estado</button>
      </div>
    `;
    ul.appendChild(li);
  });
  ul.querySelectorAll('.advance').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const res = await fetch(`${API}/ordenes/${id}/estado`, { method: 'PUT' });
      if (res.ok) cargarOrdenes();
    });
  });
}

qs('#btn-registrar').addEventListener('click', registrar);
qs('#btn-login').addEventListener('click', login);
qs('#btn-crear-orden').addEventListener('click', crearOrden);
qs('#btn-logout').addEventListener('click', () => setCliente(null));

setCliente(state.cliente);
