#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    return [key, rest.length ? rest.join('=') : 'true'];
  })
);

const email = String(args.email || '').trim().toLowerCase();
const role = String(args.role || 'staff').trim();
const name = String(args.name || '').trim();
const password = String(args.password || '');
const create = args.create === 'true';
const sqlOnly = args.sql === 'true';
const allowedRoles = new Set(['staff', 'admin']);

function fail(message) {
  console.error(message);
  console.error('Usage: npm run admin:promote -- --email=admin@example.com --role=staff');
  console.error('Create local-only user: npm run admin:promote -- --email=admin@example.com --role=admin --create --name="Admin Name" --password=12-plus-chars');
  console.error('D1 promotion SQL: npm run admin:promote -- --email=admin@example.com --role=staff --sql');
  process.exit(1);
}

if (!email.includes('@')) {
  fail('Missing or invalid --email.');
}

if (!allowedRoles.has(role)) {
  fail('Refusing unsafe role. Allowed roles: staff, admin.');
}

if (sqlOnly && create) {
  fail('D1 SQL mode only promotes existing users. Register the user first, then promote by email.');
}

if (create && (!name || password.length < 12)) {
  fail('Creating a local admin requires --name and --password with at least 12 characters.');
}

function hashPassword(value, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(value, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

if (sqlOnly) {
  console.log(`UPDATE users
SET role = ${sqlString(role)}
WHERE lower(email) = lower(${sqlString(email)});

-- Verify exactly one row was updated:
SELECT id, email, role FROM users WHERE lower(email) = lower(${sqlString(email)});`);
  process.exit(0);
}

const dbPath = path.join(process.cwd(), 'database.json');
if (!fs.existsSync(dbPath)) {
  fail('database.json was not found. Run this from the repo root.');
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
db.users = Array.isArray(db.users) ? db.users : [];
const existing = db.users.find((user) => String(user.email || '').toLowerCase() === email);

if (!existing && !create) {
  fail(`No local user found for ${email}. Register first or rerun with --create for local dev only.`);
}

if (existing) {
  existing.role = role;
  if (name) existing.name = name;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n');
  console.log(`Promoted existing local user ${email} to ${role}.`);
  process.exit(0);
}

db.users.push({
  id: `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
  name,
  email,
  role,
  passwordHash: hashPassword(password),
  createdAt: new Date().toISOString()
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n');
console.log(`Created local ${role} user ${email}. Password was not printed.`);
