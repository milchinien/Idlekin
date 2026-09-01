import type { ContentRegistry } from '@idlekin/shared';
import type { CharacterSnapshot } from '@idlekin/shared';
import { resetMovement } from './movementSystem.js';

export function enterPortal(character: CharacterSnapshot, portalId: string, content: ContentRegistry) {
  const area = content.area(character.areaId);
  const portal = area.portals.find(value => value.id === portalId); if (!portal) throw new Error('Portal nicht gefunden');
  const distance = Math.hypot(character.x + 6 - portal.position.x, character.y + 20 - portal.position.y);
  if (distance > 32) throw new Error('Portal ist zu weit entfernt');
  const target = content.area(portal.targetArea);
  const spawn = target.spawns.find(value => value.id === portal.targetSpawn); if (!spawn) throw new Error('Portalziel besitzt keinen Einstiegspunkt');
  character.areaId = target.id; character.x = spawn.x; character.y = spawn.y; resetMovement(character);
  return target;
}
