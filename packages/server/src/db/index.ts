import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

const filename = process.env.IDLEKIN_DB ?? new URL('../../idlekin.sqlite', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
export const sqlite = new Database(filename);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
export const db = drizzle(sqlite, { schema });
