import pool from '../src/lib/db.js';

async function init() {
  const client = await pool.connect();
  try {
    await client.query(\
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      );
    \);
    console.log('✅ Users table created');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}
init();
