import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const players = sqliteTable('players', {
  id: text('id').primaryKey(), name: text('name').notNull().unique(), currency: integer('currency').notNull().default(0),
  createdAt: integer('created_at').notNull(), lastSeenAt: integer('last_seen_at').notNull(),
});
export const characters = sqliteTable('characters', {
  id: text('id').primaryKey(), playerId: text('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), level: integer('level').notNull().default(1), experience: integer('experience').notNull().default(0),
  areaId: text('area_id').notNull(), posX: integer('pos_x').notNull(), posY: integer('pos_y').notNull(), createdAt: integer('created_at').notNull(),
}, table => [uniqueIndex('character_name_per_player').on(table.playerId, table.name)]);
export const sessions = sqliteTable('sessions', {
  token: text('token').primaryKey(), playerId: text('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }), expiresAt: integer('expires_at').notNull(),
});
