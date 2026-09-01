import type { Area, MovementState } from '@idlekin/shared';
import { Camera } from './camera.js'; import { loadImage, drawPlatforms, drawTiledBackground } from './layers.js'; import { PLAYER_ANIMATIONS, PLAYER_FRAME, type PlayerAnimation } from './atlas.js';
export class Renderer {
  private ctx: CanvasRenderingContext2D; private camera = new Camera(); private player = loadImage('/player/Final Player/toUse.png'); private portal = loadImage('/portals/production/evergreen-dimensional-portal-6f.png'); private images = new Map<string, HTMLImageElement>(); private animation: PlayerAnimation = 'idle'; private clock = 0;
  constructor(private canvas: HTMLCanvasElement) { this.ctx = canvas.getContext('2d')!; this.ctx.imageSmoothingEnabled = false; this.resize(); addEventListener('resize', () => this.resize()); }
  private resize() { const scale = Math.max(1, Math.floor(Math.min((innerWidth - 32) / 480, (innerHeight - 100) / 270))); this.canvas.style.width = `${480 * scale}px`; this.canvas.style.height = `${270 * scale}px`; }
  snap(state: MovementState, area: Area) { this.camera.snap(state.x, area.size.width); }
  render(state: MovementState, previous: MovementState, area: Area, alpha: number, dt: number, debug: boolean) {
    this.clock += dt; const x = previous.x + (state.x - previous.x) * alpha; const y = previous.y + (state.y - previous.y) * alpha; this.camera.update(x + 6, area.size.width, dt); const ctx = this.ctx; ctx.clearRect(0,0,480,270); ctx.imageSmoothingEnabled = false;
    const background = area.layers.find(layer => layer.kind === 'background'); if (background) { const image = this.image(background.image); drawTiledBackground(ctx,image,this.camera.x,background.parallax); }
    const tiles = area.layers.find(layer => layer.kind === 'tiles'); if (tiles) drawPlatforms(ctx,this.image(tiles.image),area,this.camera.x);
    for (const portal of area.portals) this.drawPortal(portal.position.x, portal.position.y, portal.id, state);
    const next: PlayerAnimation = !state.grounded ? (state.vy < 0 ? 'jump' : 'fall_loop') : Math.abs(state.vx) < 4 ? 'idle' : Math.abs(state.vx) < 108 ? 'walk' : 'run'; if (next !== this.animation) { this.animation = next; this.clock = 0; }
    const animation = PLAYER_ANIMATIONS[this.animation]; const raw = Math.floor(this.clock * animation.fps); const frame = animation.loop ? raw % animation.frames : Math.min(raw, animation.frames - 1); const anchorX = Math.round(x - this.camera.x + 6); const anchorY = Math.round(y + 20); ctx.save(); if (state.facing < 0) { ctx.translate(anchorX * 2,0); ctx.scale(-1,1); } ctx.drawImage(this.player,frame*PLAYER_FRAME,animation.row*PLAYER_FRAME,PLAYER_FRAME,PLAYER_FRAME,anchorX-64,anchorY-80,PLAYER_FRAME,PLAYER_FRAME); ctx.restore();
    if (debug) { ctx.strokeStyle='#ff5656';ctx.strokeRect(Math.round(x-this.camera.x)+.5,Math.round(y)+.5,11,19);ctx.strokeStyle='#55a7ff88';for(const rect of [...area.collision.solids,...area.collision.platforms])ctx.strokeRect(Math.round(rect.x-this.camera.x)+.5,rect.y+.5,rect.w-1,rect.h-1); }
  }
  private image(source:string){let image=this.images.get(source);if(!image){image=loadImage(source);this.images.set(source,image);}return image;}
  private drawPortal(x:number,y:number,id:string,state:MovementState){const frame=Math.floor(this.clock*8)%6;const sx=(frame%3)*512,sy=Math.floor(frame/3)*512;this.ctx.drawImage(this.portal,sx,sy,512,512,Math.round(x-this.camera.x-38),y-76,76,76);if(Math.abs(state.x+6-x)<=32){this.ctx.fillStyle='#10151ddd';this.ctx.fillRect(Math.round(x-this.camera.x-42),y-94,84,14);this.ctx.fillStyle='#fff';this.ctx.font="10px Idlekin";this.ctx.textAlign='center';this.ctx.fillText('E  Portal',Math.round(x-this.camera.x),y-84);this.ctx.textAlign='left';}}
}
