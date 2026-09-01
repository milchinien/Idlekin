import { describe, expect, it } from 'vitest';
import { stepMovement, type MovementInput, type MovementState } from './movement.js';
import { IDLEON_MOVEMENT } from './movementConstants.js';

const area = { solids: [{ x: 0, y: 230, w: 1000, h: 40 }], platforms: [{ x: 200, y: 170, w: 100, h: 6 }] };
const start = (): MovementState => ({ x: 40, y: 210, w: 12, h: 20, vx: 0, vy: 0, grounded: true, coyote: .08, jumpBuffer: 0, facing: 1 });
const idle: MovementInput = { left: false, right: false, jump: false, jumpPressed: false, down: false };
describe('Bewegung', () => {
  it('erreicht exakt die Maximalgeschwindigkeit', () => { let state=start(); for(let i=0;i<120;i++)state=stepMovement(state,{...idle,right:true},area,IDLEON_MOVEMENT); expect(state.vx).toBe(150); });
  it('landet exakt auf der Bodenkante', () => { let state=start(); state=stepMovement(state,{...idle,jump:true,jumpPressed:true},area,IDLEON_MOVEMENT); for(let i=0;i<180&&!state.grounded;i++)state=stepMovement(state,{...idle,jump:true},area,IDLEON_MOVEMENT); expect(state.y).toBe(210); expect(state.grounded).toBe(true); });
  it('ist bei gleicher Eingabe deterministisch', () => { const run=()=>{let state=start();for(let i=0;i<600;i++)state=stepMovement(state,{...idle,right:i<300,jump:i<50,jumpPressed:i===10},area,IDLEON_MOVEMENT);return state;}; expect(run()).toEqual(run()); });
});
