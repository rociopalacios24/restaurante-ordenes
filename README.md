# restaurante-ordenes

App mínima de pedidos para restaurante (clientes + órdenes) con **Node.js + Express + PostgreSQL** y **frontend HTML/JS**.

## Endpoints
1. `POST /clientes/registrar` → registra cliente (email único).
2. `POST /clientes/login` → login con `email + telefono`.
3. `POST /ordenes` → crea orden (`cliente_id`, `platillo_nombre`, `notes`).
4. `GET /ordenes/:clienteId` → lista órdenes del cliente.
5. `PUT /ordenes/:id/estado` → avanza estado `pending → preparing → delivered`.

## SQL
Ver `backend/sql/schema.sql` (tablas **clientes** y **ordenes** con campo `notes` NOT NULL).

## Render
1) Crea **PostgreSQL** y ejecuta `backend/sql/schema.sql` en la consola de la DB.  
2) **Web Service** (root: `backend/`)  
   - Build: `npm install`  
   - Start: `node server.js`  
   - Env: `NODE_ENV=production`, `DATABASE_URL=<External DB URL>`  
3) **Static Site** (root: `frontend/`)  
   - Build: _(vacío)_  
   - Publish dir: `.`  
4) En `frontend/app.js`, fija `const API = 'https://tu-backend.onrender.com'`.

¡Listo!
