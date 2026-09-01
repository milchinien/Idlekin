import { IDLEON_MOVEMENT, stepMovement, type Area, type CharacterSnapshot, type MovementInput, type MovementState } from '@idlekin/shared';

const states = new Map<string, MovementState>();
export function movementState(character: CharacterSnapshot): MovementState {
  const existing = states.get(character.id); if (existing) return existing;
  const state: MovementState = { x: character.x, y: character.y, w: 12, h: 20, vx: 0, vy: 0, grounded: false, coyote: 0, jumpBuffer: 0, facing: 1 };
  states.set(character.id, state); return state;
}
export function moveCharacter(character: CharacterSnapshot, input: MovementInput, area: Area): MovementState {
  let state = movementState(character);
  for (let substep = 0; substep < 3; substep += 1) state = stepMovement(state, { ...input, jumpPressed: substep === 0 && input.jumpPressed }, area.collision, IDLEON_MOVEMENT);
  state.x = Math.max(0, Math.min(area.size.width - state.w, state.x));
  if (state.y > area.size.height + 60) {
    const spawn = area.spawns.find(value => value.id === 'spawn.default') ?? area.spawns[0];
    if (!spawn) throw new Error(`Gebiet ${area.id} besitzt keinen Einstiegspunkt`);
    state = { x: spawn.x, y: spawn.y, w: 12, h: 20, vx: 0, vy: 0, grounded: false, coyote: 0, jumpBuffer: 0, facing: 1 };
  }
  states.set(character.id, state); character.x = state.x; character.y = state.y; return state;
}
export function resetMovement(character: CharacterSnapshot) { states.delete(character.id); }
export function ensureValidPosition(character: CharacterSnapshot, area: Area) {
  if (character.x < 0 || character.x > area.size.width - 12 || character.y < -area.size.height || character.y > area.size.height + 60) {
    const spawn = area.spawns.find(value => value.id === 'spawn.default') ?? area.spawns[0];
    if (!spawn) throw new Error(`Gebiet ${area.id} besitzt keinen Einstiegspunkt`);
    character.x = spawn.x; character.y = spawn.y; resetMovement(character);
  }
}
