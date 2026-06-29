export const sentenciasSchema = [
  `CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY NOT NULL,
    nombre TEXT NOT NULL UNIQUE
  );`,
  `CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY NOT NULL,
    categoria_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    sku TEXT UNIQUE,
    marca TEXT,
    unidad_medida TEXT NOT NULL,
    cantidad_por_presentacion REAL NOT NULL,
    precio_venta_actual REAL NOT NULL,
    costo_compra_actual REAL NOT NULL,
    tasa_iva REAL NOT NULL DEFAULT 0.13,
    umbral_stock_bajo REAL NOT NULL DEFAULT 1,
    activo INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (categoria_id) REFERENCES categorias (id)
  );`,
  `CREATE TABLE IF NOT EXISTS proveedores (
    id INTEGER PRIMARY KEY NOT NULL,
    nombre TEXT NOT NULL,
    telefono TEXT,
    nota TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS historial_precios (
    id INTEGER PRIMARY KEY NOT NULL,
    producto_id INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('venta', 'compra')),
    valor REAL NOT NULL,
    vigente_desde TEXT NOT NULL,
    vigente_hasta TEXT,
    FOREIGN KEY (producto_id) REFERENCES productos (id)
  );`,
  `CREATE TABLE IF NOT EXISTS compras (
    id INTEGER PRIMARY KEY NOT NULL,
    fecha TEXT NOT NULL,
    proveedor_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad REAL NOT NULL,
    costo_unitario REAL NOT NULL,
    tasa_iva REAL NOT NULL DEFAULT 0,
    subtotal REAL NOT NULL,
    iva_monto REAL NOT NULL,
    total REAL NOT NULL,
    metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('Efectivo', 'SINPE Móvil')),
    nota TEXT,
    imagen_factura TEXT,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores (id),
    FOREIGN KEY (producto_id) REFERENCES productos (id)
  );`,
  `CREATE TABLE IF NOT EXISTS inventario (
    id INTEGER PRIMARY KEY NOT NULL,
    fecha TEXT NOT NULL,
    tipo_movimiento TEXT NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida')),
    producto_id INTEGER NOT NULL,
    cantidad REAL NOT NULL,
    compra_id INTEGER,
    venta_id INTEGER,
    nota TEXT,
    FOREIGN KEY (producto_id) REFERENCES productos (id),
    FOREIGN KEY (compra_id) REFERENCES compras (id),
    FOREIGN KEY (venta_id) REFERENCES ventas (id)
  );`,
  `CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY NOT NULL,
    fecha TEXT NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad REAL NOT NULL,
    precio_unitario REAL NOT NULL,
    tasa_iva REAL NOT NULL DEFAULT 0,
    subtotal REAL NOT NULL,
    iva_monto REAL NOT NULL,
    total REAL NOT NULL,
    metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('Efectivo', 'SINPE Móvil')),
    cliente_telefono TEXT,
    nota TEXT,
    FOREIGN KEY (producto_id) REFERENCES productos (id)
  );`,
  `CREATE TABLE IF NOT EXISTS gastos (
    id INTEGER PRIMARY KEY NOT NULL,
    fecha TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    monto REAL NOT NULL,
    nota TEXT,
    imagen_factura TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS configuracion (
    clave TEXT PRIMARY KEY NOT NULL,
    valor TEXT NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas (fecha);`,
  `CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras (fecha);`,
  `CREATE INDEX IF NOT EXISTS idx_inventario_producto ON inventario (producto_id);`,
];
