import type { Area, CharacterId, CharacterSnapshot, PlayerSnapshot } from '../index.js';
import type { MovementInput, MovementState } from '../sim/movement.js';

export type ClientMessage =
  | { t: 'auth'; token: string }
  | { t: 'ping'; sent: number }
  | { t: 'subscribe'; characterId: CharacterId }
  | { t: 'move'; characterId: CharacterId; sequence: number; input: MovementInput }
  | { t: 'enterPortal'; characterId: CharacterId; portalId: string };

export type ServerMessage =
  | { t: 'authOk'; player: PlayerSnapshot; serverTime: number }
  | { t: 'authFail'; reason: string; serverTime: number }
  | { t: 'pong'; sent: number; serverTime: number }
  | { t: 'state'; characterId: CharacterId; state: CharacterSnapshot; area: Area; serverTime: number }
  | { t: 'moveAck'; characterId: CharacterId; sequence: number; state: MovementState; serverTime: number }
  | { t: 'area'; characterId: CharacterId; state: CharacterSnapshot; area: Area; serverTime: number }
  | { t: 'error'; code: string; message: string; serverTime: number };

export function parseClientMessage(text: string): ClientMessage {
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== 'object' || typeof (value as { t?: unknown }).t !== 'string') {
    throw new Error('Nachricht besitzt keinen Typ');
  }
  return value as ClientMessage;
}
