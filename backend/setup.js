require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const DB_NAME = process.env.DB_NAME || 'sbd_store';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

async function setup() {
  const admin = new Client({
    user: DB_USER,
    host: DB_HOST,
    database: 'postgres',
    password: DB_PASSWORD,
    port: DB_PORT,
  });

  await admin.connect();
  console.log('Connected to PostgreSQL');

  const exists = await admin.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
  if (exists.rows.length === 0) {
    await admin.query(`CREATE DATABASE "${DB_NAME}"`);
    console.log(`Database "${DB_NAME}" created`);
  } else {
    console.log(`Database "${DB_NAME}" already exists`);
  }
  await admin.end();

  const db = new Client({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
  });

  await db.connect();
  console.log(`Connected to "${DB_NAME}"`);

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      phone VARCHAR(20),
      password VARCHAR(255) NOT NULL,
      balance INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      price INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      total INTEGER NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Tables created');

  const userCount = await db.query('SELECT COUNT(*) FROM users');
  if (parseInt(userCount.rows[0].count) > 0) {
    console.log('Seed data already exists, skipping');
    await db.end();
    return;
  }

  const salt = 10;
  const [hash1, hash2, hash3] = await Promise.all([
    bcrypt.hash('Password123!', salt),
    bcrypt.hash('Password123!', salt),
    bcrypt.hash('Password123!', salt),
  ]);

  await db.query(`
    INSERT INTO users (name, username, email, phone, password, balance) VALUES
    ('Alice', 'alice', 'alice@example.com', '+1-555-0100', $1, 50000),
    ('Bob', 'bob', 'bob@example.com', '+1-555-0101', $2, 0),
    ('Charlie', 'charlie', 'charlie@example.com', '+1-555-0102', $3, 100000)
  `, [hash1, hash2, hash3]);

  await db.query(`
    INSERT INTO items (name, price, stock) VALUES
    ('Laptop', 1000000, 10),
    ('Mouse', 50000, 100),
    ('Keyboard', 150000, 50),
    ('Monitor', 300000, 20)
  `);

  const users = await db.query('SELECT id FROM users ORDER BY id');
  const items = await db.query('SELECT id FROM items ORDER BY id');
  const [u1, u2, u3] = users.rows.map(r => r.id);
  const [i1, i2, i3, i4] = items.rows.map(r => r.id);

  await db.query(`
    INSERT INTO transactions (user_id, item_id, quantity, total, status, description) VALUES
    ($1, $5, 1, 1000000, 'paid', 'Beli laptop untuk kerja'),
    ($1, $6, 2, 100000, 'paid', 'Mouse cadangan'),
    ($2, $7, 1, 150000, 'pending', 'Keyboard mekanikal'),
    ($3, $8, 1, 300000, 'pending', 'Monitor 24 inch')
  `, [u1, u2, u3, u3, i1, i2, i3, i4]);

  console.log('Seed data inserted');
  console.log('');
  console.log('Demo accounts (password: Password123!):');
  console.log('  alice@example.com   balance: Rp 50.000');
  console.log('  bob@example.com     balance: Rp 0');
  console.log('  charlie@example.com balance: Rp 100.000');

  await db.end();
  console.log('');
  console.log('Setup complete!');
}

setup().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
