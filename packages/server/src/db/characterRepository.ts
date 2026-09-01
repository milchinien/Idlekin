import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import type { AreaId, CharacterId, CharacterSnapshot, PlayerId } from '@idlekin/shared';
import { db } from './index.js';
import { characters } from './schema.js';

const snapshot = (row: typeof characters.$inferSelect): CharacterSnapshot => ({
  id: row.id as CharacterId, name: row.name, level: row.level, experience: row.experience,
  areaId: row.areaId as AreaId, x: row.posX, y: row.posY,
});
export const characterRepository = {
  list(playerId: string): CharacterSnapshot[] { return db.select().from(characters).where(eq(characters.playerId, playerId)).all().map(snapshot); },
  ensureFirst(playerId: PlayerId): CharacterSnapshot {
    const existing = this.list(playerId)[0];
    if (existing) return existing;
    const row: typeof characters.$inferInsert = { id: uuidv7(), playerId, name: 'Kin', level: 1, experience: 0, areaId: 'area.dorf', posX: 64, posY: 190, createdAt: Date.now() };
    db.insert(characters).values(row).run();
    return snapshot(row as typeof characters.$inferSelect);
  },
  save(value: CharacterSnapshot) { db.update(characters).set({ areaId: value.areaId, posX: Math.round(value.x), posY: Math.round(value.y), name: value.name, level: value.level, experience: value.experience }).where(eq(characters.id, value.id)).run(); },
};
