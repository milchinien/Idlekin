import { describe, expect, it } from 'vitest';
import type { ClientMessage, ServerMessage } from './messages.js';

describe('Protokoll', () => {
  it('serialisiert jede Client-Nachrichtenart', () => {
    const messages: ClientMessage[] = [
      { t: 'auth', token: 'token' }, { t: 'ping', sent: 1 }, { t: 'subscribe', characterId: 'character.test' as never },
      { t: 'move', characterId: 'character.test' as never, sequence: 1, input: { left: false, right: true, jump: false, jumpPressed: false, down: false } },
      { t: 'enterPortal', characterId: 'character.test' as never, portalId: 'portal.test' },
    ];
    for (const message of messages) expect(JSON.parse(JSON.stringify(message))).toEqual(message);
  });
  it('serialisiert Server-Nachrichten einschließlich Serverzeit', () => {
    const message: ServerMessage = { t: 'pong', sent: 12, serverTime: 42 };
    expect(JSON.parse(JSON.stringify(message))).toEqual(message);
  });
});
