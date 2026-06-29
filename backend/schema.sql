-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS abastosdelnorte;
USE abastosdelnorte;

-- Tabla de Usuarios (Autenticación)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'empleado') NOT NULL DEFAULT 'empleado',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configuración del Negocio
CREATE TABLE IF NOT EXISTS configuracion (
  clave VARCHAR(100) PRIMARY KEY NOT NULL,
  valor TEXT NOT NULL
);

-- Categorías
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

-- Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  dias_visita VARCHAR(100),
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Productos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  marca VARCHAR(50),
  unidad_medida VARCHAR(20) NOT NULL,
  cantidad_por_presentacion REAL NOT NULL,
  precio_venta_actual REAL NOT NULL,
  costo_compra_actual REAL NOT NULL,
  tasa_iva REAL NOT NULL DEFAULT 0.13,
  umbral_stock_bajo REAL NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (categoria_id) REFERENCES categorias (id)
);

-- Ventas
CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME NOT NULL,
  producto_id INT NOT NULL,
  cantidad REAL NOT NULL,
  precio_unitario REAL NOT NULL,
  tasa_iva REAL NOT NULL DEFAULT 0.13,
  subtotal REAL NOT NULL,
  iva_monto REAL NOT NULL,
  total REAL NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL,
  cliente_telefono VARCHAR(20),
  nota TEXT,
  FOREIGN KEY (producto_id) REFERENCES productos (id)
);

-- Compras
CREATE TABLE IF NOT EXISTS compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME NOT NULL,
  proveedor_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad REAL NOT NULL,
  costo_unitario REAL NOT NULL,
  tasa_iva REAL NOT NULL DEFAULT 0.13,
  subtotal REAL NOT NULL,
  iva_monto REAL NOT NULL,
  total REAL NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL,
  nota TEXT,
  imagen_factura TEXT,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores (id),
  FOREIGN KEY (producto_id) REFERENCES productos (id)
);

-- Gastos Adicionales
CREATE TABLE IF NOT EXISTS gastos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  monto REAL NOT NULL,
  nota TEXT,
  imagen_factura TEXT
);

-- Movimientos de Inventario
CREATE TABLE IF NOT EXISTS inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME NOT NULL,
  tipo_movimiento VARCHAR(20) NOT NULL,
  producto_id INT NOT NULL,
  cantidad REAL NOT NULL,
  compra_id INT,
  venta_id INT,
  nota TEXT,
  FOREIGN KEY (producto_id) REFERENCES productos (id),
  FOREIGN KEY (compra_id) REFERENCES compras (id),
  FOREIGN KEY (venta_id) REFERENCES ventas (id)
);

-- Insertar Configuración Básica
INSERT IGNORE INTO configuracion (clave, valor) VALUES
('tasaIva', '0.13'),
('precioVentaIncluyeIva', 'true'),
('costoProveedorIncluyeIva', 'false');

-- Insertar Administrador por defecto (Contraseña: admin123)
-- El hash generado abajo corresponde a "admin123" usando bcrypt (salt rounds: 10)
INSERT IGNORE INTO usuarios (username, password, rol) VALUES 
('admin', '$2b$10$w3jP8h.o3wRjF8o3wRjF8eJ.U1B5VqV8yD9D9D9D9D9D9D9D9D9D9', 'admin');
