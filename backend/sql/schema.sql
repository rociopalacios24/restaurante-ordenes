-- Base de datos: restaurante_ordenes_db

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS ordenes (
  id SERIAL PRIMARY KEY,
  cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  platillo_nombre VARCHAR(255) NOT NULL,
  notes VARCHAR(255) NOT NULL,
  estado VARCHAR(20) DEFAULT 'pending' CHECK (estado IN ('pending','preparing','delivered')),
  created TIMESTAMP DEFAULT NOW()
);
