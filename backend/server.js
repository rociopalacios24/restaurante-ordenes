import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();
const app = express();

app.use(cors({ origin: '*', methods: ['GET','POST','PUT'] }));
app.use(express.json());

// 1) Registrar cliente
app.post('/clientes/registrar', async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body ?? {};
    if (!nombre || !email || !telefono) {
      return res.status(400).json({ error: 'nombre, email y telefono son requeridos' });
    }
    const exists = await pool.query('SELECT id FROM clientes WHERE email=$1', [email]);
    if (exists.rowCount > 0) return res.status(409).json({ error: 'Email ya registrado' });

    const { rows } = await pool.query(
      'INSERT INTO clientes(nombre,email,telefono) VALUES($1,$2,$3) RETURNING id,nombre,email,telefono',
      [nombre, email, telefono]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error registrando cliente' });
  }
});

// 2) Login cliente (email + telefono)
app.post('/clientes/login', async (req, res) => {
  try {
    const { email, telefono } = req.body ?? {};
    if (!email || !telefono) return res.status(400).json({ error: 'email y telefono requeridos' });

    const { rows } = await pool.query(
      'SELECT id,nombre,email,telefono FROM clientes WHERE email=$1 AND telefono=$2',
      [email, telefono]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error en login' });
  }
});

// 3) Crear orden (incluye notes NOT NULL)
app.post('/ordenes', async (req, res) => {
  try {
    const { cliente_id, platillo_nombre, notes } = req.body ?? {};
    if (!cliente_id || !platillo_nombre || !notes) {
      return res.status(400).json({ error: 'cliente_id, platillo_nombre y notes son requeridos' });
    }
    const { rows } = await pool.query(
      'INSERT INTO ordenes(cliente_id, platillo_nombre, notes) VALUES($1,$2,$3) RETURNING *',
      [cliente_id, platillo_nombre, notes]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error creando orden' });
  }
});

// 4) Listar órdenes de un cliente
app.get('/ordenes/:clienteId', async (req, res) => {
  try {
    const clienteId = Number(req.params.clienteId);
    if (!clienteId) return res.status(400).json({ error: 'clienteId inválido' });

    const { rows } = await pool.query(
      'SELECT * FROM ordenes WHERE cliente_id=$1 ORDER BY created DESC',
      [clienteId]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error listando órdenes' });
  }
});

// 5) Avanzar estado de una orden
app.put('/ordenes/:id/estado', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const { rows } = await pool.query('SELECT estado FROM ordenes WHERE id=$1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Orden no encontrada' });

    const actual = rows[0].estado || 'pending';
    const next = actual === 'pending' ? 'preparing' : (actual === 'preparing' ? 'delivered' : 'delivered');

    const updated = await pool.query('UPDATE ordenes SET estado=$1 WHERE id=$2 RETURNING *', [next, id]);
    res.json(updated.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error actualizando estado' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en :${PORT}`));
