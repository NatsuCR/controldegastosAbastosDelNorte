const fs = require('fs');
const db = require('./db');

async function run() {
  try {
    const sql = fs.readFileSync('schema.sql', 'utf8');
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');

    console.log('Ejecutando sentencias SQL...');
    for (let stmt of statements) {
      if (stmt.trim()) {
        await db.query(stmt);
      }
    }
    console.log('✅ Base de datos inicializada correctamente con schema.sql');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error inicializando DB:', err);
    process.exit(1);
  }
}

run();
