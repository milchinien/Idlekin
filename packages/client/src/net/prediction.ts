import { IDLEON_MOVEMENT, stepMovement, type Area, type MovementInput, type MovementState } from '@idlekin/shared';
interface Pending { sequence: number; input: MovementInput }
export class Prediction {
  state!: MovementState; previous!: MovementState; private pending: Pending[] = [];
  reset(x: number, y: number) { this.state = { x, y, w: 12, h: 20, vx: 0, vy: 0, grounded: false, coyote: 0, jumpBuffer: 0, facing: 1 }; this.previous = { ...this.state }; this.pending = []; }
  predict(input: MovementInput, area: Area) { this.previous = { ...this.state }; this.state = stepMovement(this.state, input, area.collision, IDLEON_MOVEMENT); }
  record(sequence: number, input: MovementInput) { this.pending.push({ sequence, input }); }
  reconcile(sequence: number, authoritative: MovementState, area: Area) { this.pending = this.pending.filter(command => command.sequence > sequence); this.state = { ...authoritative }; for (const command of this.pending) for (let step = 0; step < 3; step += 1) this.state = stepMovement(this.state, { ...command.input, jumpPressed: step === 0 && command.input.jumpPressed }, area.collision, IDLEON_MOVEMENT); this.previous = { ...this.state }; }
}
