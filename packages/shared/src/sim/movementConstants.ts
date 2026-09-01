export interface MovementConstants {
  maxSpeed: number; accel: number; friction: number; jumpVel: number; gravity: number;
  fallMult: number; lowJumpMult: number; maxFall: number; apexThresh: number;
  apexGravity: number; apexControl: number; airControl: number; airFriction: number;
  coyote: number; buffer: number; cornerFix: number; maxStep: number;
}
export const IDLEON_MOVEMENT: MovementConstants = Object.freeze({
  maxSpeed: 150, accel: 1200, friction: 1600, jumpVel: 330, gravity: 1100,
  fallMult: 1.4, lowJumpMult: 2, maxFall: 700, apexThresh: 60, apexGravity: 0.55,
  apexControl: 1.25, airControl: 0.8, airFriction: 400, coyote: 0.08,
  buffer: 0.1, cornerFix: 4, maxStep: 4,
});
