import type { FastifyInstance } from 'fastify';
import { playerRepository } from '../db/playerRepository.js';
import { sessionRepository } from './session.js';

export function registerHttp(app: FastifyInstance) {
  const started = Date.now();
  app.get('/health', async () => ({ version: '0.0.0', uptimeMs: Date.now() - started }));
  app.post<{ Body: { name?: string } }>('/auth/dev', async (request, reply) => {
    if (process.env.IDLEKIN_ALLOW_DEV_AUTH !== '1') return reply.code(404).send({ error: 'Nicht verfügbar' });
    const name = request.body?.name?.trim(); if (!name || name.length > 24) return reply.code(400).send({ error: 'Name muss 1–24 Zeichen besitzen' });
    const player = playerRepository.findOrCreate(name); return { token: sessionRepository.create(player.id), playerId: player.id };
  });
}
