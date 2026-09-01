import type { Rect } from '../types/area.js';
import type { MovementConstants } from './movementConstants.js';

export interface MovementInput { left: boolean; right: boolean; jump: boolean; jumpPressed: boolean; down: boolean }
export interface MovementState {
  x: number; y: number; w: number; h: number; vx: number; vy: number;
  grounded: boolean; coyote: number; jumpBuffer: number; facing: -1 | 1;
}
export interface AreaCollision { solids: Rect[]; platforms: Rect[] }
const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export function stepMovement(source: MovementState, input: MovementInput, area: AreaCollision, c: MovementConstants, dt = 1 / 60): MovementState {
  const s = { ...source };
  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (direction) s.facing = direction as -1 | 1;
  const apex = !s.grounded && Math.abs(s.vy) < c.apexThresh;
  const acceleration = s.grounded ? c.accel : c.accel * c.airControl * (apex ? c.apexControl : 1);
  const friction = s.grounded ? c.friction : c.airFriction;
  if (direction) {
    const turning = s.vx !== 0 && Math.sign(s.vx) !== direction;
    s.vx += direction * (turning ? acceleration + friction : acceleration) * dt;
    if (Math.abs(s.vx) > c.maxSpeed) s.vx = Math.sign(s.vx) * c.maxSpeed;
  } else {
    const drop = friction * dt;
    s.vx = Math.abs(s.vx) <= drop ? 0 : s.vx - Math.sign(s.vx) * drop;
  }
  s.coyote = s.grounded ? c.coyote : Math.max(0, s.coyote - dt);
  s.jumpBuffer = input.jumpPressed ? c.buffer : Math.max(0, s.jumpBuffer - dt);
  if (s.jumpBuffer > 0 && s.coyote > 0) {
    s.vy = -c.jumpVel; s.grounded = false; s.coyote = 0; s.jumpBuffer = 0;
  }
  let gravity = c.gravity;
  if (s.vy > 0) gravity *= c.fallMult;
  else if (!input.jump) gravity *= c.lowJumpMult;
  if (apex) gravity *= c.apexGravity;
  s.vy = Math.min(s.vy + gravity * dt, c.maxFall);

  const distance = Math.max(Math.abs(s.vx), Math.abs(s.vy)) * dt;
  const steps = Math.max(1, Math.ceil(distance / c.maxStep));
  for (let step = 0; step < steps; step += 1) {
    const dx = s.vx * dt / steps;
    s.x += dx;
    for (const solid of area.solids) if (overlaps(s, solid)) { s.x = dx > 0 ? solid.x - s.w : solid.x + solid.w; s.vx = 0; }

    const dy = s.vy * dt / steps;
    const previousBottom = s.y + s.h;
    s.y += dy; s.grounded = false;
    for (const solid of area.solids) {
      if (!overlaps(s, solid)) continue;
      if (dy > 0) { s.y = solid.y - s.h; s.vy = 0; s.grounded = true; continue; }
      let nudge = 0;
      for (let offset = 1; offset <= Math.round(c.cornerFix) && nudge === 0; offset += 1) {
        for (const sign of [1, -1]) if (!area.solids.some(candidate => overlaps({ ...s, x: s.x + sign * offset }, candidate))) { nudge = sign * offset; break; }
      }
      if (nudge) s.x += nudge; else { s.y = solid.y + solid.h; s.vy = 0; }
    }
    if (dy > 0 && !input.down) for (const platform of area.platforms) {
      if (overlaps(s, platform) && previousBottom <= platform.y + 1) { s.y = platform.y - s.h; s.vy = 0; s.grounded = true; }
    }
  }
  return s;
}
