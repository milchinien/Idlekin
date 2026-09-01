import { and, eq, gt } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { db } from '../db/index.js';
import { sessions } from '../db/schema.js';

export const sessionRepository = {
  create(playerId: string) { const token = uuidv7(); db.insert(sessions).values({ token, playerId, expiresAt: Date.now() + 30 * 86_400_000 }).run(); return token; },
  resolve(token: string) { return db.select().from(sessions).where(and(eq(sessions.token, token), gt(sessions.expiresAt, Date.now()))).get(); },
};
