import type { FastifyInstance } from 'fastify';
import type { PlayerId, ServerMessage } from '@idlekin/shared';
import { createRandom, parseClientMessage } from '@idlekin/shared';
import { sessionRepository } from './session.js';
import { playerService } from '../systems/playerService.js';
import { ensureValidPosition, moveCharacter } from '../systems/movementSystem.js';
import { enterPortal } from '../systems/areaSystem.js';
import type { ContentRegistry } from '@idlekin/shared';

export function registerSocket(app: FastifyInstance, content: ContentRegistry) {
  app.get('/ws', { websocket: true }, socket => {
    let playerId: PlayerId | undefined;
    const random = createRandom(0x1d1e_2026);
    const lag = Math.max(0, Number(process.env.IDLEKIN_NET_LAG ?? 0));
    const loss = Math.max(0, Math.min(1, Number(process.env.IDLEKIN_NET_LOSS ?? 0)));
    const send = (message: ServerMessage) => { if (loss > 0 && random() < loss) return; const deliver = () => { if (socket.readyState === 1) socket.send(JSON.stringify(message)); }; if (lag > 0) setTimeout(deliver, lag); else deliver(); };
    socket.on('message', (raw: { toString(): string }) => {
      try {
        const message = parseClientMessage(raw.toString());
        if (!playerId) {
          if (message.t !== 'auth') { socket.close(1008, 'Anmeldung erforderlich'); return; }
          const session = sessionRepository.resolve(message.token);
          if (!session) { send({ t: 'authFail', reason: 'Sitzung ungültig', serverTime: Date.now() }); socket.close(); return; }
          playerId = session.playerId as PlayerId; send({ t: 'authOk', player: playerService.load(playerId), serverTime: Date.now() }); return;
        }
        if (message.t === 'ping') send({ t: 'pong', sent: message.sent, serverTime: Date.now() });
        else if (message.t === 'subscribe') {
          const character = playerService.character(playerId, message.characterId); if (!character) throw new Error('Charakter nicht gefunden');
          const area = content.area(character.areaId); ensureValidPosition(character, area);
          send({ t: 'state', characterId: character.id, state: character, area, serverTime: Date.now() });
        } else if (message.t === 'move') {
          const character = playerService.character(playerId, message.characterId); if (!character) throw new Error('Charakter nicht gefunden');
          const state = moveCharacter(character, message.input, content.area(character.areaId));
          send({ t: 'moveAck', characterId: character.id, sequence: message.sequence, state, serverTime: Date.now() });
        } else if (message.t === 'enterPortal') {
          const character = playerService.character(playerId, message.characterId); if (!character) throw new Error('Charakter nicht gefunden');
          const area = enterPortal(character, message.portalId, content); playerService.save(playerId);
          send({ t: 'area', characterId: character.id, state: character, area, serverTime: Date.now() });
        }
      } catch (error) { send({ t: 'error', code: 'request_failed', message: error instanceof Error ? error.message : 'Unbekannter Fehler', serverTime: Date.now() }); }
    });
    socket.on('close', () => { if (playerId) playerService.unload(playerId); });
  });
}
