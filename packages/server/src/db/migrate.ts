import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const target = process.env.IDLEKIN_DB ?? fileURLToPath(new URL('../../idlekin.sqlite', import.meta.url));
const database = new Database(target);
database.pragma('foreign_keys = ON');
database.exec('CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)');
const name = '0000_init.sql';
const applied = database.prepare('SELECT 1 FROM _migrations WHERE name = ?').get(name);
if (!applied) {
  const sql = readFileSync(new URL(`../../migrations/${name}`, import.meta.url), 'utf8');
  database.transaction(() => { database.exec(sql); database.prepare('INSERT INTO _migrations VALUES (?, ?)').run(name, Date.now()); })();
  console.log(`Migration angewendet: ${name}`);
} else console.log('Datenbank ist aktuell.');
database.close();
