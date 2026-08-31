// Prototyp 01 - Side-View-Bewegung im Stil von IdleOn.
// Frage: Fuehlt sich die Steuerung gut an?
// Deshalb: kompletter Testparcours + alle Werte live justierbar (siehe tuning.js).

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hudEl = document.getElementById('hud');

// Die Welt rechnet weiter in 480x270. Der 2x-Backbuffer zeichnet Fonts mit
// echten 16 statt hochskalierten 8 Pixeln und beseitigt so die unscharfen
// Einzelpixel-Kanten, ohne die Pixel-Art weichzufiltern.
const VIEW_W = 480;
const VIEW_H = 270;
const CSS_SCALE = 2;
const PIXEL_RATIO = Math.max(1, window.devicePixelRatio || 1);
canvas.width = Math.round(VIEW_W * CSS_SCALE * PIXEL_RATIO);
canvas.height = Math.round(VIEW_H * CSS_SCALE * PIXEL_RATIO);
const RENDER_SCALE = canvas.width / VIEW_W;
ctx.imageSmoothingEnabled = false;
// Die Welt ist 3,5 Bildschirme breit. Vorher waren es 5 - das war fuer eine
// einzelne Welt zu weitlaeufig, zumal der Hintergrund nur 480x270 gross ist.
const MAP_W = 1680;
const GROUND_Y = 230;
const TILE_SIZE = 32;
const TILE_SOURCE_SIZE = 64;
const BODY_SOURCE_INSET = 8;
const RULER_X = 205;

// --- Kartenhintergruende ---------------------------------------------------
// Reine Kulisse in Bildschirmkoordinaten: keine Kollision, kein Gameplay.
// Die 480x270-Versionen entsprechen exakt der nativen Canvas-Aufloesung.
const BACKGROUNDS = [
  {
    id: 'mountains',
    label: 'Bergwiese',
    src: '../../assets/world/meadow-mountains/backgrounds/mountains-meadow-day.png',
    tilesetSrc: '../../assets/world/meadow-mountains/tiles/platform-tileset.png',
    portalHue: 165,
    portalColor: '#86e9ff',
    portalAccent: '#d9fbff',
  },
  {
    id: 'forest',
    label: 'Waldwiese',
    src: '../../assets/world/meadow-forest/backgrounds/meadow-forest-day.png',
    tilesetSrc: '../../assets/world/meadow-forest/tiles/platform-tileset.png',
    portalHue: 0,
    portalColor: '#5dff9a',
    portalAccent: '#dcff8b',
  },
  {
    id: 'cave',
    label: 'Hoehle',
    src: '../../assets/world/red-brown-cave/backgrounds/cave-red-brown-dark.png',
    tilesetSrc: '../../assets/world/red-brown-cave/tiles/platform-tileset.png',
    portalHue: 255,
    portalColor: '#ff73d5',
    portalAccent: '#ffc6ed',
  },
  {
    id: 'jungle',
    label: 'Dschungel',
    src: '../../assets/world/jungle/backgrounds/jungle-tall-trees.png',
    tilesetSrc: '../../assets/world/jungle/tiles/platform-tileset.png',
    portalHue: 55,
    portalColor: '#ffe36e',
    portalAccent: '#fff3b1',
  },
];

const BG_STORAGE_KEY = 'proto01-background';
let activeBackground = 0;

try {
  const savedBackground = localStorage.getItem(BG_STORAGE_KEY);
  const savedIndex = BACKGROUNDS.findIndex(bg => bg.id === savedBackground);
  if (savedIndex >= 0) activeBackground = savedIndex;
} catch (e) { /* Persistenz ist fuer den Prototyp optional. */ }

for (const bg of BACKGROUNDS) {
  bg.image = new Image();
  bg.image.src = bg.src;
  bg.tileset = new Image();
  bg.tileset.src = bg.tilesetSrc;
}

// --- Modularer Player-Body ------------------------------------------------
// Die Grafik ist von Physik und Hitbox getrennt. Weitere Cosmetic-Layer koennen
// spaeter mit demselben Frame und demselben Anker darueber gezeichnet werden.
const PLAYER_ATLAS_SRC = '../../assets/player/Final Player/toUse.png';
const PLAYER_FRAME_SIZE = 128;
const PLAYER_FRAME_BASELINE = 80;
const PLAYER_FRAME_CENTER_X = 64;
const PLAYER_ANIMATIONS = {
  idle:      { cells: [[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1]], frames: 10, fps: 8, loop: true },
  walk:      { cells: [[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2]], frames: 10, fps: 10, loop: true },
  run:       { cells: [[0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3]], frames: 10, fps: 14, loop: true },
  jump:      { cells: [[0,4],[1,4],[2,4],[3,4],[4,4],[5,4]], frames: 6, fps: 12, loop: false },
  fall:      { cells: [[0,5],[1,5],[2,5],[3,5]], frames: 4, fps: 10, loop: false },
  fall_loop: { cells: [[0,6],[1,6],[2,6]], frames: 3, fps: 8, loop: true },
  melee:     { cells: [[0,7],[1,7],[2,7],[0,8],[1,8],[2,8],[3,8]], frames: 7, fps: 14, loop: false },
};
const playerAtlas = new Image();
playerAtlas.src = PLAYER_ATLAS_SRC;

// Das neue 3x2-Spritesheet ist ein endloser Sechs-Frame-Loop. Es gibt
// absichtlich keinen inaktiven, zerstoerten, startenden oder stoppenden Zustand.
const portalImage = new Image();
portalImage.src = '../../assets/portals/production/evergreen-dimensional-portal-6f.png';
// Beide Portale stehen bewusst im erreichbaren Teil der Welt: vor der letzten
// Luecke und vor der 60-px-Wand. Die Wand ist mit rund 48 px Sprunghoehe
// ohnehin nicht zu ueberwinden, sie bleibt reine Referenzmarke.
const PORTALS = [
  { x: 150,  direction: -1, exitX: 1275 },
  { x: 1345, direction: 1,  exitX: 90 },
];
const PORTAL_FRAME_RATE = 8;
let portalClock = 0;
let portalTravelCooldown = 0;
let worldFlash = 0;

function selectBackground(index) {
  activeBackground = (index + BACKGROUNDS.length) % BACKGROUNDS.length;
  const selected = BACKGROUNDS[activeBackground];
  for (const button of document.querySelectorAll('#backgrounds button')) {
    button.classList.toggle('active', button.dataset.background === selected.id);
  }
  try { localStorage.setItem(BG_STORAGE_KEY, selected.id); } catch (e) { /* optional */ }
}

function buildBackgroundPicker() {
  const root = document.getElementById('backgrounds');
  for (let index = 0; index < BACKGROUNDS.length; index++) {
    const bg = BACKGROUNDS[index];
    const button = document.createElement('button');
    button.textContent = bg.label;
    button.dataset.background = bg.id;
    button.addEventListener('click', () => selectBackground(index));
    root.appendChild(button);
  }
  selectBackground(activeBackground);
}

// Kein Kollisionsschritt groesser als das duennste Hindernis, sonst wird es
// bei hohem Tempo durchtunnelt. Die Einweg-Plattformen sind 6 px hoch.
const MAX_STEP = 4;

// --- Level -----------------------------------------------------------------
// Die Luecken werden absichtlich breiter: so liest man direkt ab, wie weit
// der Charakter mit den aktuellen Werten kommt.
// Luecken 40/60/80/100. Die maximale Sprungweite mit Anlauf liegt bei rund
// 93 px, die ersten drei sind also schaffbar und die letzte markiert die Grenze.
// Vorher waren es 50/80/110/140 - damit war alles hinter der dritten Luecke
// unerreichbar und das rechte Portal nie zu betreten.
const SOLIDS = [
  // Boden-Segmente
  { x: 0,    y: GROUND_Y, w: 320, h: 40 },  // Spawn, Lineal, Portal links
  { x: 360,  y: GROUND_Y, w: 240, h: 40 },  // Ueberhang
  { x: 660,  y: GROUND_Y, w: 300, h: 40 },  // Treppe
  { x: 1040, y: GROUND_Y, w: 340, h: 40 },  // Einweg-Plattformen, Portal rechts
  { x: 1480, y: GROUND_Y, w: 200, h: 40 },  // Wand
  // Treppe - testet Sprunghoehe in Stufen von 32 px
  { x: 680,  y: 190, w: 60, h: 8 },
  { x: 760,  y: 158, w: 60, h: 8 },
  { x: 840,  y: 126, w: 60, h: 8 },
  // Ueberhang - testet die Ecken-Korrektur beim Anstossen
  { x: 400,  y: 148, w: 120, h: 14 },
  // Wand + Vorsprung am Ende
  { x: 1600, y: 170, w: 16, h: 60 },
  { x: 1630, y: 170, w: 50, h: 8 },
  // Begrenzungen
  { x: -16,   y: -200, w: 16, h: 470 },
  { x: MAP_W, y: -200, w: 16, h: 470 },
];

// Einweg-Plattformen: von unten durchspringen, mit S durchfallen.
const ONEWAY = [
  { x: 1070, y: 185, w: 70, h: 6 },
  { x: 1160, y: 150, w: 70, h: 6 },
  { x: 1250, y: 185, w: 70, h: 6 },
];

const ZONE_LABELS = [
  { x: RULER_X, y: 120, t: 'Hoehen-Lineal' },
  { x: 322,  y: 214, t: 'Luecke 40' },
  { x: 602,  y: 214, t: 'Luecke 60' },
  { x: 962,  y: 214, t: 'Luecke 80' },
  { x: 1382, y: 214, t: 'Luecke 100' },
  { x: 680,  y: 112, t: 'Treppe (32 px/Stufe)' },
  { x: 1070, y: 136, t: 'Einweg-Plattformen' },
  { x: 400,  y: 140, t: 'Ueberhang (Ecken-Korrektur)' },
  { x: 1590, y: 200, t: 'Wand 60 px' },
];

const SPAWN = { x: 40, y: 180 };

// --- Spielerzustand --------------------------------------------------------
const player = {
  x: SPAWN.x, y: SPAWN.y, w: 12, h: 20,
  vx: 0, vy: 0,
  grounded: false,
  coyote: 0,
  facing: 1,
  squash: 0,     // Landeimpuls, klingt ab
  apex: false,   // nur fuer die HUD-Anzeige
};

let jumpBuffer = 0;
let debug = false;
let dust = [];
let shake = 0;
const playerAnimation = { state: 'idle', clock: 0, meleeRemaining: 0 };

// Zustand vor dem letzten Simulationsschritt - Basis der Render-Interpolation.
const prev = { x: SPAWN.x, y: SPAWN.y, camX: 0 };

// Messwerte des letzten Sprungs - der eigentliche Erkenntnisgewinn.
let jumpTrack = null;
let lastJump = { height: 0, dist: 0, air: 0 };
let cornerFixes = 0;

// --- Input -----------------------------------------------------------------
const keys = new Set();
const JUMP_KEYS = [' ', 'w', 'arrowup'];
const BLOCKED = [' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (BLOCKED.includes(k)) e.preventDefault();
  if (k === 'f1') { e.preventDefault(); debug = !debug; return; }
  if (e.repeat) return;
  if (k === 'b') { selectBackground(activeBackground + 1); return; }
  if (k === 'e') { useNearbyPortal(); return; }
  if (k === 'j') {
    const melee = PLAYER_ANIMATIONS.melee;
    playerAnimation.meleeRemaining = melee.frames / melee.fps;
    playerAnimation.state = 'melee';
    playerAnimation.clock = 0;
    return;
  }
  keys.add(k);
  if (JUMP_KEYS.includes(k)) jumpBuffer = P.buffer;
  if (k === 'r') respawn();
});

addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
// Fokusverlust darf keine haengenden Tasten hinterlassen.
addEventListener('blur', () => keys.clear());

const held = (...ks) => ks.some(k => keys.has(k));

function respawn() {
  player.x = SPAWN.x; player.y = SPAWN.y;
  player.vx = 0; player.vy = 0;
  playerAnimation.state = 'idle';
  playerAnimation.clock = 0;
  playerAnimation.meleeRemaining = 0;
  jumpTrack = null;
  snapCamera();
  prev.x = player.x; prev.y = player.y; prev.camX = cam.x;
}

function portalDestination(portal) {
  return (activeBackground + portal.direction + BACKGROUNDS.length) % BACKGROUNDS.length;
}

function nearbyPortal() {
  const centerX = player.x + player.w / 2;
  return PORTALS.find(portal => Math.abs(centerX - portal.x) <= 46) || null;
}

function useNearbyPortal() {
  const portal = nearbyPortal();
  if (!portal || portalTravelCooldown > 0) return;

  selectBackground(portalDestination(portal));
  player.x = portal.exitX;
  player.y = GROUND_Y - player.h;
  player.vx = 0;
  player.vy = 0;
  player.grounded = true;
  jumpTrack = null;
  portalTravelCooldown = 0.65;
  worldFlash = 1;
  snapCamera();
  prev.x = player.x;
  prev.y = player.y;
  prev.camX = cam.x;
}

// --- Kollision -------------------------------------------------------------
const overlaps = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const box = (x, y) => ({ x, y, w: player.w, h: player.h });

function hitsSolid(b) {
  for (const s of SOLIDS) if (overlaps(b, s)) return true;
  return false;
}

function moveX(dx) {
  if (dx === 0) return;
  player.x += dx;
  for (const s of SOLIDS) {
    if (!overlaps(player, s)) continue;
    player.x = dx > 0 ? s.x - player.w : s.x + s.w;
    player.vx = 0;
  }
}

/**
 * Sucht beim Deckenstoss eine seitliche Ausweichbewegung.
 * Ohne das bleibt man an einer knapp verfehlten Kante haengen und
 * verliert den kompletten Sprung - der haeufigste Frustmoment ueberhaupt.
 */
function cornerNudge() {
  const max = Math.round(P.cornerFix);
  for (let o = 1; o <= max; o++) {
    for (const dir of [1, -1]) {
      if (!hitsSolid(box(player.x + dir * o, player.y))) return dir * o;
    }
  }
  return 0;
}

function moveY(dy) {
  if (dy === 0) return;
  const prevBottom = player.y + player.h;
  player.y += dy;
  player.grounded = false;

  for (const s of SOLIDS) {
    if (!overlaps(player, s)) continue;

    if (dy > 0) {
      player.y = s.y - player.h;
      player.vy = 0;
      player.grounded = true;
      continue;
    }

    const nudge = cornerNudge();
    if (nudge !== 0) {
      player.x += nudge;
      cornerFixes++;
      break; // Position ist wieder frei, Sprung laeuft weiter
    }
    player.y = s.y + s.h;
    player.vy = 0;
  }

  // Einweg: nur von oben, nur wenn wir vorher wirklich darueber waren.
  if (dy > 0 && !held('s', 'arrowdown')) {
    for (const s of ONEWAY) {
      if (!overlaps(player, s)) continue;
      if (prevBottom > s.y + 1) continue;
      player.y = s.y - player.h;
      player.vy = 0;
      player.grounded = true;
    }
  }
}

/**
 * Bewegung in Teilschritten. Ein einzelner Schritt ueber die volle
 * Frame-Distanz wuerde duenne Plattformen bei hohem Tempo ueberspringen.
 */
function moveAndCollide(dt) {
  const dist = Math.max(Math.abs(player.vx), Math.abs(player.vy)) * dt;
  const steps = Math.max(1, Math.ceil(dist / MAX_STEP));
  for (let i = 0; i < steps; i++) {
    // vx/vy pro Schritt neu lesen: nach einer Kollision sind sie 0.
    moveX((player.vx * dt) / steps);
    moveY((player.vy * dt) / steps);
  }
}

// --- Simulation ------------------------------------------------------------
function update(dt) {
  prev.x = player.x;
  prev.y = player.y;
  prev.camX = cam.x;
  portalClock += dt;
  portalTravelCooldown = Math.max(0, portalTravelCooldown - dt);
  worldFlash = Math.max(0, worldFlash - dt * 2.8);

  const wasGrounded = player.grounded;
  const impactVy = player.vy;

  const dir = (held('d', 'arrowright') ? 1 : 0) - (held('a', 'arrowleft') ? 1 : 0);
  if (dir !== 0) player.facing = dir;

  // Apex: kurz vor dem Scheitelpunkt haengt der Sprung etwas laenger.
  player.apex = !player.grounded && Math.abs(player.vy) < P.apexThresh;

  // Horizontal
  const accel = player.grounded
    ? P.accel
    : P.accel * P.airControl * (player.apex ? P.apexControl : 1);
  const fric = player.grounded ? P.friction : P.airFriction;

  if (dir !== 0) {
    // Richtungswechsel bremst zusaetzlich - sonst fuehlt sich Umkehren traege an.
    const turning = player.vx !== 0 && Math.sign(player.vx) !== dir;
    if (turning && player.grounded && Math.abs(player.vx) > P.maxSpeed * 0.5) spawnDust(2);
    player.vx += dir * (turning ? accel + fric : accel) * dt;
    if (Math.abs(player.vx) > P.maxSpeed) player.vx = Math.sign(player.vx) * P.maxSpeed;
  } else {
    const drop = fric * dt;
    player.vx = Math.abs(player.vx) <= drop ? 0 : player.vx - Math.sign(player.vx) * drop;
  }

  // Assists
  player.coyote = player.grounded ? P.coyote : Math.max(0, player.coyote - dt);
  jumpBuffer = Math.max(0, jumpBuffer - dt);

  // Sprung
  if (jumpBuffer > 0 && player.coyote > 0) {
    player.vy = -P.jumpVel;
    player.grounded = false;
    player.coyote = 0;
    jumpBuffer = 0;
    jumpTrack = { x0: player.x, y0: player.y, peak: 0, t: 0 };
    spawnDust(6);
  }

  player.vy = Math.min(player.vy + gravityNow(player.vy, held(...JUMP_KEYS)) * dt, P.maxFall);

  moveAndCollide(dt);
  updateCamera(dt);

  // Sprung vermessen
  if (jumpTrack) {
    jumpTrack.t += dt;
    jumpTrack.peak = Math.max(jumpTrack.peak, jumpTrack.y0 - player.y);
    if (player.grounded) {
      lastJump = {
        height: jumpTrack.peak,
        dist: Math.abs(player.x - jumpTrack.x0),
        air: jumpTrack.t,
      };
      jumpTrack = null;
    }
  }

  // Landung
  if (!wasGrounded && player.grounded && impactVy > 80) {
    const hardness = Math.min(1, impactVy / 500);
    player.squash = hardness;
    shake = Math.max(shake, hardness * P.shake);
    spawnDust(Math.round(hardness * 8));
  }
  player.squash = Math.max(0, player.squash - dt * 5);
  shake = Math.max(0, shake - dt * 4);

  if (player.y > VIEW_H + 60) respawn();

  updateDust(dt);
  updatePlayerAnimation(dt);
}

function nextPlayerAnimation() {
  if (playerAnimation.meleeRemaining > 0) return 'melee';
  if (!player.grounded) {
    if (player.vy < 0) return 'jump';
    const fall = PLAYER_ANIMATIONS.fall;
    if (playerAnimation.state === 'fall' && playerAnimation.clock >= fall.frames / fall.fps) {
      return 'fall_loop';
    }
    if (playerAnimation.state === 'fall_loop') return 'fall_loop';
    return 'fall';
  }

  const speed = Math.abs(player.vx);
  if (speed < 4) return 'idle';
  return speed < P.maxSpeed * 0.72 ? 'walk' : 'run';
}

function updatePlayerAnimation(dt) {
  playerAnimation.meleeRemaining = Math.max(0, playerAnimation.meleeRemaining - dt);
  const next = nextPlayerAnimation();
  if (next !== playerAnimation.state) {
    playerAnimation.state = next;
    playerAnimation.clock = 0;
  } else {
    playerAnimation.clock += dt;
  }
}

/** Gravitationsregeln an einer Stelle - update() und simulateJump() teilen sie. */
function gravityNow(vy, holdingJump) {
  let g = P.gravity;
  if (vy > 0) g *= P.fallMult;
  else if (vy < 0 && !holdingJump) g *= P.lowJumpMult;
  if (Math.abs(vy) < P.apexThresh) g *= P.apexGravity;
  return g;
}

// --- Staub (nur Optik, hilft aber beim Beurteilen des Gefuehls) -------------
function spawnDust(n) {
  for (let i = 0; i < n; i++) {
    dust.push({
      x: player.x + player.w / 2,
      y: player.y + player.h,
      vx: (Math.random() - 0.5) * 60,
      vy: -Math.random() * 30,
      life: 0.3 + Math.random() * 0.25,
    });
  }
}

function updateDust(dt) {
  for (const d of dust) {
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    d.vy += 200 * dt;
    d.life -= dt;
  }
  dust = dust.filter(d => d.life > 0);
}

// --- Kamera ----------------------------------------------------------------
const cam = { x: 0 };
let viewX = 0; // Kameraposition, mit der tatsaechlich gezeichnet wird

const clampCam = x => Math.max(0, Math.min(MAP_W - VIEW_W, x));

function camTarget() {
  // Bewusst ohne Vorausschau: die schwenkte bei jedem Richtungswechsel quer
  // ueber den doppelten Vorhaltewert und war beim Hin- und Herlaufen unruhig.
  // Die Kamera haelt den Charakter schlicht mittig.
  return player.x + player.w / 2 - VIEW_W / 2;
}

function updateCamera(dt) {
  // Exponentielle Glaettung - haengt nicht an der Framerate.
  const t = 1 - Math.exp(-P.camSmooth * dt);
  cam.x = clampCam(cam.x + (camTarget() - cam.x) * t);
}

function snapCamera() {
  cam.x = clampCam(camTarget());
}

// --- Rendering -------------------------------------------------------------
function drawBackground() {
  const bg = BACKGROUNDS[activeBackground];
  if (bg.image.complete && bg.image.naturalWidth > 0) {
    drawParallaxBackground(bg.image);
    return;
  }
  drawBackgroundFallback();
}

/**
 * Die Hintergruende sind exakt 480x270 gross, also genau ein Bildschirm.
 * Damit gibt es keinen Ueberschuss, den man verschieben koennte - ohne
 * Kacheln muesste der Hintergrund starr am Bildschirm kleben.
 *
 * Deshalb wird gekachelt und jede zweite Kachel gespiegelt: dann trifft die
 * rechte Kante einer Kachel immer auf ihr eigenes Spiegelbild und es entsteht
 * nie eine sichtbare Naht - unabhaengig davon, ob das Bild nahtlos gebaut ist.
 * Bei Parallaxe 0 steht der Hintergrund exakt wie vorher still.
 */
function drawParallaxBackground(image) {
  const bx = viewX * P.bgParallax; // linker Bildschirmrand, im Hintergrund gemessen
  const first = Math.floor((bx - 8) / VIEW_W);

  for (let k = first; k * VIEW_W < bx + VIEW_W + 8; k++) {
    const sx = k * VIEW_W - bx;
    const mirrored = (((k % 2) + 2) % 2) === 1;

    if (!mirrored) {
      ctx.drawImage(image, sx, -8, VIEW_W, VIEW_H + 16);
      continue;
    }
    // save/restore statt setTransform - der Screenshake liegt bereits
    // als Transformation an und darf nicht verlorengehen.
    ctx.save();
    ctx.translate(sx + VIEW_W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(image, 0, -8, VIEW_W, VIEW_H + 16);
    ctx.restore();
  }
}

function drawBackgroundFallback() {
  // Lade-Fallback, damit der Prototyp auch bei einem fehlenden Asset laeuft.
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, '#1b2340');
  sky.addColorStop(1, '#2c2a3a');
  ctx.fillStyle = sky;
  ctx.fillRect(-8, -8, VIEW_W + 16, VIEW_H + 16);

  // Zwei Parallax-Ebenen - machen die Laufgeschwindigkeit ueberhaupt erst lesbar.
  drawHills(0.25, '#232a44', 205, 55, 260);
  drawHills(0.5,  '#2b3352', 220, 38, 180);
}

function drawHills(factor, color, baseY, height, spacing) {
  const off = -viewX * factor;
  ctx.fillStyle = color;
  const first = Math.floor((-off) / spacing) - 1;
  for (let i = first; i < first + VIEW_W / spacing + 3; i++) {
    const cx = i * spacing + off;
    ctx.beginPath();
    ctx.moveTo(cx - spacing * 0.6, baseY);
    ctx.quadraticCurveTo(cx, baseY - height, cx + spacing * 0.6, baseY);
    ctx.fill();
  }
  ctx.fillRect(-8, baseY, VIEW_W + 16, VIEW_H - baseY + 16);
}

function drawRuler() {
  // Senkrechtes Lineal am Start: Sprunghoehe direkt ablesbar.
  const x = RULER_X - viewX;
  if (x < -120 || x > VIEW_W) return;
  ctx.font = "8px 'Idlekin', sans-serif";
  ctx.textBaseline = 'middle';
  for (let h = 20; h <= 120; h += 20) {
    const y = GROUND_Y - h;
    ctx.strokeStyle = h % 40 === 0 ? 'rgba(160,180,220,0.40)' : 'rgba(160,180,220,0.18)';
    ctx.beginPath();
    ctx.moveTo(x, y + 0.5);
    ctx.lineTo(x + 90, y + 0.5);
    ctx.stroke();
    ctx.fillStyle = 'rgba(180,196,230,0.7)';
    ctx.fillText(String(h), x - 12, y);
  }
}

function drawPlatformRect(platform, fallbackColor) {
  const x = Math.round(platform.x - viewX);
  const y = Math.round(platform.y);
  if (x + platform.w < 0 || x > VIEW_W) return;

  const atlas = BACKGROUNDS[activeBackground].tileset;
  if (!atlas.complete || atlas.naturalWidth !== TILE_SOURCE_SIZE * 4 || atlas.naturalHeight !== TILE_SOURCE_SIZE * 2) {
    ctx.fillStyle = fallbackColor;
    ctx.fillRect(x, y, platform.w, platform.h);
    return;
  }

  const useCaps = platform.w >= TILE_SIZE * 2;
  let tileIndex = 0;
  for (let offsetX = 0; offsetX < platform.w; offsetX += TILE_SIZE) {
    const drawWidth = Math.min(TILE_SIZE, platform.w - offsetX);
    const isFirst = offsetX === 0;
    const isLast = offsetX + drawWidth >= platform.w;
    let column = 1 + (tileIndex % 2);
    if (useCaps && isFirst) column = 0;
    else if (useCaps && isLast) column = 3;

    // Beim schmalen rechten Reststueck wird die rechte Kante des Cap-Tiles benutzt.
    const sourceWidth = drawWidth / TILE_SIZE * TILE_SOURCE_SIZE;
    const sourceX = column * TILE_SOURCE_SIZE + (column === 3 ? TILE_SOURCE_SIZE - sourceWidth : 0);
    const topHeight = Math.min(TILE_SIZE, platform.h);
    const sourceTopHeight = topHeight / TILE_SIZE * TILE_SOURCE_SIZE;
    ctx.drawImage(
      atlas,
      sourceX, 0, sourceWidth, sourceTopHeight,
      x + offsetX, y, drawWidth, topHeight,
    );

    for (let offsetY = TILE_SIZE; offsetY < platform.h; offsetY += TILE_SIZE) {
      const drawHeight = Math.min(TILE_SIZE, platform.h - offsetY);
      const sourceHeight = drawHeight / TILE_SIZE * (TILE_SOURCE_SIZE - BODY_SOURCE_INSET);
      ctx.drawImage(
        atlas,
        sourceX, TILE_SOURCE_SIZE + BODY_SOURCE_INSET, sourceWidth, sourceHeight,
        x + offsetX, y + offsetY, drawWidth, drawHeight,
      );
    }
    tileIndex++;
  }
}

function drawPlatforms() {
  for (const platform of SOLIDS) drawPlatformRect(platform, '#3f4a3a');
  for (const platform of ONEWAY) drawPlatformRect(platform, '#6b5a3c');
}

function drawLabels() {
  ctx.font = "8px 'Idlekin', sans-serif";
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(190,190,210,0.55)';
  for (const l of ZONE_LABELS) {
    const x = l.x - viewX;
    if (x < -140 || x > VIEW_W) continue;
    ctx.fillText(l.t, x, l.y);
  }
}

function drawDust() {
  for (const d of dust) {
    ctx.fillStyle = 'rgba(200,200,180,' + Math.max(0, d.life * 2).toFixed(2) + ')';
    ctx.fillRect(Math.round(d.x - viewX), Math.round(d.y), 2, 2);
  }
}

function drawPortal(portal, index) {
  const destination = BACKGROUNDS[portalDestination(portal)];
  const x = Math.round(portal.x - viewX);
  if (x < -90 || x > VIEW_W + 90) return;

  const baseY = GROUND_Y;
  const glow = ctx.createRadialGradient(x, baseY - 30, 3, x, baseY - 28, 45);
  glow.addColorStop(0, destination.portalColor + '70');
  glow.addColorStop(0.55, destination.portalColor + '22');
  glow.addColorStop(1, destination.portalColor + '00');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 50, baseY - 82, 100, 90);

  // Ruhige Bodenrune: pulsiert, wird aber nie ausgeblendet.
  const pulse = 0.78 + Math.sin(portalClock * 3.2 + index) * 0.12;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.strokeStyle = destination.portalColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x, baseY - 2, 26, 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Sechs feste Partikelbahnen geben jeder Welt eine eigene Farbe und Tiefe.
  for (let i = 0; i < 6; i++) {
    const phase = portalClock * (0.8 + i * 0.045) + i * 1.047 + index * 0.6;
    const radius = 27 + (i % 2) * 8;
    const px = x + Math.cos(phase) * radius;
    const py = baseY - 36 + Math.sin(phase) * (28 + (i % 3) * 3);
    const size = i % 3 === 0 ? 2 : 1;
    ctx.fillStyle = i % 2 ? destination.portalAccent : destination.portalColor;
    ctx.fillRect(Math.round(px), Math.round(py), size, size);
  }

  if (portalImage.complete && portalImage.naturalWidth > 0) {
    const frame = Math.floor(portalClock * PORTAL_FRAME_RATE) % 6;
    const column = frame % 3;
    const row = Math.floor(frame / 3);
    const sw = portalImage.naturalWidth / 3;
    const sh = portalImage.naturalHeight / 2;
    const size = 76;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.filter = `hue-rotate(${destination.portalHue}deg) saturate(1.12)`;
    ctx.drawImage(
      portalImage,
      column * sw, row * sh, sw, sh,
      Math.round(x - size / 2), baseY - size, size, size,
    );
    ctx.restore();
  }

  ctx.font = "8px 'Idlekin', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillStyle = destination.portalAccent;
  ctx.fillText(destination.label, x, baseY - 78);

  if (nearbyPortal() === portal && portalTravelCooldown <= 0) {
    const text = 'E  Reise nach ' + destination.label;
    const width = ctx.measureText(text).width + 10;
    ctx.fillStyle = 'rgba(12,14,20,0.86)';
    ctx.fillRect(Math.round(x - width / 2), baseY - 97, Math.ceil(width), 12);
    ctx.strokeStyle = destination.portalColor;
    ctx.strokeRect(Math.round(x - width / 2) + 0.5, baseY - 96.5, Math.ceil(width) - 1, 11);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, baseY - 89);
  }
  ctx.textAlign = 'left';
}

function drawPortals() {
  for (let i = 0; i < PORTALS.length; i++) drawPortal(PORTALS[i], i);
}

function drawPlayer(px, py) {
  const animation = PLAYER_ANIMATIONS[playerAnimation.state];
  if (!playerAtlas.complete || playerAtlas.naturalWidth === 0) return;

  const rawFrame = Math.floor(playerAnimation.clock * animation.fps);
  const frame = animation.loop
    ? rawFrame % animation.frames
    : Math.min(rawFrame, animation.frames - 1);
  const [column, row] = animation.cells[frame];
  const anchorX = Math.round(px - viewX + player.w / 2);
  const anchorY = Math.round(py + player.h);
  const drawX = anchorX - PLAYER_FRAME_CENTER_X;
  const drawY = anchorY - PLAYER_FRAME_BASELINE;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (player.facing < 0) {
    ctx.translate(anchorX * 2, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(
    playerAtlas,
    column * PLAYER_FRAME_SIZE, row * PLAYER_FRAME_SIZE,
    PLAYER_FRAME_SIZE, PLAYER_FRAME_SIZE,
    drawX, drawY, PLAYER_FRAME_SIZE, PLAYER_FRAME_SIZE,
  );
  ctx.restore();
}

function drawDebug(px, py) {
  ctx.strokeStyle = 'rgba(255,90,90,0.9)';
  ctx.strokeRect(px - viewX + 0.5, py + 0.5, player.w - 1, player.h - 1);
  ctx.strokeStyle = 'rgba(90,160,255,0.5)';
  for (const s of SOLIDS.concat(ONEWAY)) {
    ctx.strokeRect(s.x - viewX + 0.5, s.y + 0.5, s.w - 1, s.h - 1);
  }
  // Kameraziel
  ctx.strokeStyle = 'rgba(255,220,90,0.6)';
  const t = camTarget() - viewX + VIEW_W / 2;
  ctx.beginPath();
  ctx.moveTo(t + 0.5, 0);
  ctx.lineTo(t + 0.5, VIEW_H);
  ctx.stroke();
}

function render(alpha) {
  const a = P.interp ? alpha : 1;
  const px = prev.x + (player.x - prev.x) * a;
  const py = prev.y + (player.y - prev.y) * a;
  viewX = prev.camX + (cam.x - prev.camX) * a;

  ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  if (shake > 0.001) {
    ctx.translate(
      Math.round((Math.random() - 0.5) * shake * 7),
      Math.round((Math.random() - 0.5) * shake * 7)
    );
  }

  drawBackground();
  drawRuler();
  drawPlatforms();
  drawLabels();
  drawPortals();
  drawDust();
  drawPlayer(px, py);
  if (debug) drawDebug(px, py);

  if (worldFlash > 0) {
    ctx.fillStyle = `rgba(210,255,245,${(worldFlash * 0.42).toFixed(3)})`;
    ctx.fillRect(-8, -8, VIEW_W + 16, VIEW_H + 16);
  }

  ctx.restore();
}

// --- Kennwerte -------------------------------------------------------------
// Numerisch simuliert statt per Formel: der Apex-Modifikator laesst sich
// analytisch nicht sauber ausdruecken, die Simulation trifft immer.
function simulateJump() {
  let vy = -P.jumpVel;
  let y = 0, t = 0, peak = 0;
  for (let i = 0; i < 1200; i++) {
    vy = Math.min(vy + gravityNow(vy, true) * STEP, P.maxFall);
    y += vy * STEP;
    t += STEP;
    peak = Math.max(peak, -y);
    if (y >= 0) break;
  }
  return { h: peak, dist: P.maxSpeed * t, air: t };
}

// --- Loop ------------------------------------------------------------------
const STEP = 1 / 60;
let acc = 0;
let last = performance.now();
let fps = 60;

function frame(now) {
  const elapsed = Math.min((now - last) / 1000, 0.25); // Spike nach Tab-Wechsel abfangen
  last = now;
  acc += elapsed;

  while (acc >= STEP) { update(STEP); acc -= STEP; }

  render(acc / STEP);

  fps += (1 / Math.max(elapsed, 1e-6) - fps) * 0.05;
  const t = simulateJump();
  const pad = (v) => String(v).padStart(6);

  hudEl.textContent =
    'Welt ' + BACKGROUNDS[activeBackground].label.padEnd(12) +
    '   Player final / ' + playerAnimation.state.padEnd(9) +
    (nearbyPortal() ? '   Portal bereit: E' : '') + '\n' +
    'vx ' + pad(player.vx.toFixed(0)) + ' px/s   vy ' + pad(player.vy.toFixed(0)) + ' px/s   ' +
    'Boden ' + (player.grounded ? 'ja  ' : 'nein') + '   Coyote ' + player.coyote.toFixed(2) + 's   ' +
    (player.apex ? 'APEX' : '    ') + '\n' +
    'Letzter Sprung   Hoehe ' + pad(lastJump.height.toFixed(0)) + ' px   ' +
    'Weite ' + pad(lastJump.dist.toFixed(0)) + ' px   Luftzeit ' + lastJump.air.toFixed(2) + 's\n' +
    'Simuliert        Hoehe ' + pad(t.h.toFixed(0)) + ' px   ' +
    'Weite ' + pad(t.dist.toFixed(0)) + ' px   Luftzeit ' + t.air.toFixed(2) + 's\n' +
    'Position x ' + pad(player.x.toFixed(0)) + '   Ecken-Korrekturen ' + cornerFixes +
    '   fps ' + fps.toFixed(0);

  requestAnimationFrame(frame);
}

Tuning.init();
buildBackgroundPicker();
snapCamera();
prev.camX = cam.x;
requestAnimationFrame(frame);
