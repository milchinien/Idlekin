// Minimaler Prototyp-Rahmen: fixer Timestep, Input, Render.
// Alles hier darf ersetzt oder geloescht werden.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('hud');
ctx.imageSmoothingEnabled = false;

// --- Input -----------------------------------------------------------------
const keys = new Set();
addEventListener('keydown', e => keys.add(e.key.toLowerCase()));
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));

// --- State -----------------------------------------------------------------
// Simulation getrennt vom Rendering halten (siehe docs/24-technische-architektur.md 24.13),
// auch im Prototyp - das kostet nichts und macht Erkenntnisse uebertragbar.
const state = {
  player: { x: 240, y: 135, speed: 60 },
  ticks: 0,
};

const SPEED_SCALE = 1; // Platzhalter fuer spaetere Modifikatoren

function update(dt) {
  const p = state.player;
  let dx = 0, dy = 0;
  if (keys.has('a') || keys.has('arrowleft'))  dx -= 1;
  if (keys.has('d') || keys.has('arrowright')) dx += 1;
  if (keys.has('w') || keys.has('arrowup'))    dy -= 1;
  if (keys.has('s') || keys.has('arrowdown'))  dy += 1;

  // Diagonale nicht schneller als gerade
  if (dx && dy) { const inv = Math.SQRT1_2; dx *= inv; dy *= inv; }

  p.x += dx * p.speed * SPEED_SCALE * dt;
  p.y += dy * p.speed * SPEED_SCALE * dt;

  p.x = Math.max(0, Math.min(canvas.width, p.x));
  p.y = Math.max(0, Math.min(canvas.height, p.y));

  state.ticks++;
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const p = state.player;
  ctx.fillStyle = '#6cc';
  ctx.fillRect(Math.round(p.x) - 4, Math.round(p.y) - 4, 8, 8);
}

// --- Loop ------------------------------------------------------------------
// Fixer Timestep: Simulation laeuft unabhaengig von der Monitor-Framerate.
const STEP = 1 / 60;
let acc = 0;
let last = performance.now();
let fps = 0;

function frame(now) {
  const elapsed = Math.min((now - last) / 1000, 0.25); // Spike-Schutz nach Tab-Wechsel
  last = now;
  acc += elapsed;

  while (acc >= STEP) {
    update(STEP);
    acc -= STEP;
  }

  render();

  fps += (1 / Math.max(elapsed, 1e-6) - fps) * 0.05;
  hud.textContent = `WASD / Pfeiltasten\nticks ${state.ticks}  fps ${fps.toFixed(0)}`;

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
