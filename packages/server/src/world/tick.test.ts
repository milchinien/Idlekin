import { describe, expect, it, vi } from 'vitest';
import { createTickLoop } from './tick.js';
describe('Server-Tick', () => { it('begrenzt das Aufholen auf fünf Schritte', () => { let now=0;let callback=()=>{};let ticks=0;createTickLoop({now:()=>now},()=>ticks++,fn=>{callback=fn;return 0 as never;});now=500;callback();expect(ticks).toBe(5); }); });
