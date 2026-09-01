import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import type { PlayerId } from '@idlekin/shared';
import { db } from './index.js';
import { players } from './schema.js';

export const playerRepository = {
  findOrCreate(name: string) {
    const existing = db.select().from(players).where(eq(players.name, name)).get();
    if (existing) return existing;
    const now = Date.now();
    const created = { id: uuidv7() as PlayerId, name, currency: 0, createdAt: now, lastSeenAt: now };
    db.insert(players).values(created).run();
    return created;
  },
  find(id: string) { return db.select().from(players).where(eq(players.id, id)).get(); },
  touch(id: string) { db.update(players).set({ lastSeenAt: Date.now() }).where(eq(players.id, id)).run(); },
};
