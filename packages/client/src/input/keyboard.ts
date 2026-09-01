import type { MovementInput } from '@idlekin/shared';
export class Keyboard {
  private keys = new Set<string>(); private jumpQueued = false; debug = false; portalQueued = false;
  constructor() {
    addEventListener('keydown', event => { const key = event.key.toLowerCase(); if ([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) event.preventDefault(); if (key === 'f1') { event.preventDefault(); this.debug = !this.debug; return; } if (key === 'e' && !event.repeat) this.portalQueued = true; if ([' ','w','arrowup'].includes(key) && !event.repeat) this.jumpQueued = true; this.keys.add(key); });
    addEventListener('keyup', event => this.keys.delete(event.key.toLowerCase())); addEventListener('blur', () => this.keys.clear());
  }
  sample(): MovementInput { const held = (...keys: string[]) => keys.some(key => this.keys.has(key)); const value = { left: held('a','arrowleft'), right: held('d','arrowright'), jump: held(' ','w','arrowup'), jumpPressed: this.jumpQueued, down: held('s','arrowdown') }; this.jumpQueued = false; return value; }
  takePortal() { const value = this.portalQueued; this.portalQueued = false; return value; }
}
