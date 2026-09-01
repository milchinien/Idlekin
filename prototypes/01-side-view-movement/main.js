const PLAYTEST_KEY = 'idlekin.playtest.payload.v1';
const PROJECT_KEY = 'idlekin.prototype04.quests.v1';
const WORLD_KEY = 'idlekin.prototype03.world.v1';
const MAPS_KEY = 'idlekin.prototype02.maps.v1';
const TILE_SIZE = 32;
const PLAYER_W = 20;
const PLAYER_H = 36;
const GRAVITY = 1250;
const SPEED = 175;
const JUMP = 430;
const STEP = 1 / 60;

const canvas = document.querySelector('#game');
const context = canvas.getContext('2d');
const imageCache = new Map();
const keys = new Set();
const progress = new Map();
const sectionCanvas = document.createElement('canvas');
let payload = null;
let world = null;
let npcs = [];
let enemyTypes = [];
let monsterSpawns = [];
const enemyImages = new Map();
let currentSection = null;
let currentCollisions = new Set();
let playerAtlas = null;
let npcAtlas = null;
let player = { x: 64, y: 0, vx: 0, vy: 0, grounded: false, facing: 1 };
let accumulator = 0;
let lastTime = performance.now();
let interactionLock = false;
let activeQuestRef = null;
let toastTimer = 0;

function clone(value) { return structuredClone(value); }
function sectionById(id) { return world?.sections.find(section => section.id === id); }
function mapWidth(section = currentSection) { return section?.mapState.map.columns * TILE_SIZE || 960; }
function mapHeight(section = currentSection) { return section?.mapState.map.rows * TILE_SIZE || 544; }
function spriteStyle(element, npc) { const sprite = npc.sprite || npc; element.style.setProperty('--sprite-x', `${-64 * (Number(sprite.col) || 0)}px`); element.style.setProperty('--sprite-y', `${-64 * (Number(sprite.row) || 0)}px`); }
function questKey(npc, quest) { return `${npc.id}:${quest.id}`; }
function stateFor(npc, quest) { const key = questKey(npc, quest); if (!progress.has(key)) progress.set(key, { accepted: false, completed: false, steps: new Set() }); return progress.get(key); }
function currentQuest() { if (!activeQuestRef) return null; const npc = npcs.find(entry => entry.id === activeQuestRef.npcId), quest = npc?.quests.find(entry => entry.id === activeQuestRef.questId); return npc && quest ? { npc, quest, state: stateFor(npc, quest) } : null; }

function readPayload() {
  try { const value = JSON.parse(localStorage.getItem(PLAYTEST_KEY) || 'null'); if (value) return value; } catch {}
  try { const saved = JSON.parse(localStorage.getItem(PROJECT_KEY) || 'null'); if (saved?.project) return { source: '04', label: 'Gespeichertes Questprojekt', returnUrl: '../04-npc-quest-editor/', project: saved.project }; } catch {}
  try { const saved = JSON.parse(localStorage.getItem(WORLD_KEY) || 'null'); if (saved?.world) return { source: '03', label: 'Gespeicherte Welt', returnUrl: '../03-world-builder/', world: saved.world }; } catch {}
  try { const maps = JSON.parse(localStorage.getItem(MAPS_KEY) || '[]'); if (maps[0]?.state) return { source: '02', label: maps[0].name, returnUrl: '../02-tilemap-editor/', map: maps[0].state }; } catch {}
  return null;
}

function normalise(value) {
  if (!value) return null;
  if (value.project?.world?.sections?.length) return { payload: value, world: clone(value.project.world), npcs: clone(value.project.npcs || []) };
  if (value.world?.sections?.length) return { payload: value, world: clone(value.world), npcs: [] };
  if (value.map) {
    const section = { id: 'play-map', name: value.label || 'Aktuelle Karte', x: 0, y: 0, mapState: clone(value.map) };
    return { payload: value, world: { version: 2, name: value.label || 'Kartentest', sections: [section], portals: [], spawn: { sectionId: section.id, x: 64, y: 64 } }, npcs: [] };
  }
  return null;
}

function imageFrom(src) {
  if (!imageCache.has(src)) imageCache.set(src, new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; }));
  return imageCache.get(src);
}
function sheetSource(sheet) { return sheet.startsWith('props/') ? `../../assets/props/Textures/${sheet.slice(6)}` : `../../assets/tileset/PNG/${sheet}`; }

async function renderSection(section) {
  const state = section.mapState, width = mapWidth(section), height = mapHeight(section);
  sectionCanvas.width = width; sectionCanvas.height = height; const ctx = sectionCanvas.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#111722'; ctx.fillRect(0, 0, width, height);
  if (state.map.background) try { ctx.drawImage(await imageFrom(`../../assets/tileset/PNG/Background/x32/${state.map.background}`), 0, 0, width, height); } catch {}
  for (const layer of state.layers || []) {
    if (layer.visible === false) continue;
    for (const placement of layer.placements || []) try {
      const image = await imageFrom(sheetSource(placement.sheet)); const grid = placement.sourceGridSize || TILE_SIZE, cols = placement.sourceColumns || placement.width, rows = placement.sourceRows || placement.height, pixelWidth = placement.pixelWidth || cols * grid, pixelHeight = placement.pixelHeight || rows * grid;
      ctx.drawImage(image, placement.sourceX * grid, placement.sourceY * grid, cols * grid, rows * grid, placement.x * TILE_SIZE, placement.y * TILE_SIZE, pixelWidth, pixelHeight);
    } catch {}
  }
}

function setSection(sectionId, x, y) {
  currentSection = sectionById(sectionId) || world?.sections[0] || null; if (!currentSection) return;
  currentCollisions = new Set(currentSection.mapState.collision || []); canvas.width = Math.min(960, mapWidth()); canvas.height = Math.min(544, mapHeight()); context.imageSmoothingEnabled = false;
  player.x = Math.max(0, Math.min(mapWidth() - PLAYER_W, Number(x) || 64)); player.y = Math.max(0, Math.min(mapHeight() - PLAYER_H, (Number(y) || 64) - PLAYER_H)); player.vx = 0; player.vy = 0; player.grounded = false;
  document.querySelector('#section-name').textContent = currentSection.name; renderSection(currentSection); updateFeatureList();
}

function hitsSolid(x, y, w = PLAYER_W, h = PLAYER_H) {
  if (x < 0 || x + w > mapWidth() || y + h > mapHeight()) return true;
  const left = Math.floor(x / TILE_SIZE), right = Math.floor((x + w - 1) / TILE_SIZE), top = Math.floor(y / TILE_SIZE), bottom = Math.floor((y + h - 1) / TILE_SIZE);
  for (let cy = top; cy <= bottom; cy++) for (let cx = left; cx <= right; cx++) if (currentCollisions.has(`${cx},${cy}`)) return true;
  return false;
}
function moveAxis(amount, axis) {
  const direction = Math.sign(amount); let remaining = Math.abs(amount);
  while (remaining > 0) { const part = Math.min(remaining, 3) * direction, nx = axis === 'x' ? player.x + part : player.x, ny = axis === 'y' ? player.y + part : player.y; if (hitsSolid(nx, ny)) { if (axis === 'y' && direction > 0) player.grounded = true; if (axis === 'x') player.vx = 0; else player.vy = 0; return; } player[axis] += part; remaining -= Math.abs(part); }
}

function update(dt) {
  if (!currentSection || document.querySelector('#npc-dialog').open) return;
  const direction = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0); player.vx += (direction * SPEED - player.vx) * Math.min(1, dt * 12); if (direction) player.facing = direction;
  player.vy = Math.min(720, player.vy + GRAVITY * dt); player.grounded = false; moveAxis(player.vx * dt, 'x'); moveAxis(player.vy * dt, 'y'); updateLocationQuests(); updatePrompt(); document.querySelector('#position-status').textContent = `Position ${Math.round(player.x)}, ${Math.round(player.y)}`;
}

function nearNpc() { return npcs.filter(npc => npc.sectionId === currentSection?.id).find(npc => Math.hypot(npc.x - (player.x + PLAYER_W / 2), npc.y - (player.y + PLAYER_H)) < 65); }
function nearPortal() { return (world?.portals || []).filter(portal => portal.sectionId === currentSection?.id).find(portal => Math.hypot(portal.x - (player.x + PLAYER_W / 2), portal.y - (player.y + PLAYER_H)) < 72); }
function updatePrompt() { const npc = nearNpc(), portal = nearPortal(), prompt = document.querySelector('#interaction-prompt'); prompt.hidden = !npc && !portal; prompt.textContent = npc ? `E · Mit ${npc.name} sprechen` : portal ? `E · ${portal.name} durchqueren` : ''; }
function interact() { if (interactionLock || !currentSection) return; interactionLock = true; setTimeout(() => { interactionLock = false; }, 180); const npc = nearNpc(); if (npc) return interactNpc(npc); const portal = nearPortal(); if (portal) travelPortal(portal); }

function nextQuestForNpc(npc) { return npc.quests.find(quest => !stateFor(npc, quest).completed); }
function interactNpc(npc) {
  completeMatchingStep('npc', target => target?.npcId === npc.id); const quest = nextQuestForNpc(npc); if (!quest) return showDialog(npc, [npc.quests.at(-1)?.completeText || 'Danke für alles, was du getan hast.'], [{ label: 'Schließen', action: closeDialog }]);
  const state = stateFor(npc, quest); if (state.accepted && allStepsDone(quest, state)) return finishQuest(npc, quest); if (state.accepted) return showDialog(npc, ['Die Aufgabe ist noch nicht abgeschlossen.', quest.summary || quest.title], [{ label: 'Weiter testen', action: closeDialog }]);
  const lines = [...(npc.dialogue || []), npc.offerText || 'Nimmst du die Quest an?']; let index = 0;
  const advance = () => { if (index < lines.length - 1) { index++; document.querySelector('#dialog-text').textContent = lines[index]; if (index === lines.length - 1) renderDialogActions([{ label: 'Ablehnen', action: closeDialog }, { label: 'Quest annehmen', className: 'accept', action: () => acceptQuest(npc, quest) }]); } };
  showDialog(npc, lines, lines.length > 1 ? [{ label: 'Weiter', action: advance }] : [{ label: 'Quest annehmen', className: 'accept', action: () => acceptQuest(npc, quest) }]);
}
function showDialog(npc, lines, actions) { const dialog = document.querySelector('#npc-dialog'); document.querySelector('#dialog-name').textContent = npc.name; document.querySelector('#dialog-role').textContent = npc.role; spriteStyle(document.querySelector('#dialog-sprite'), npc); document.querySelector('#dialog-text').textContent = lines[0] || '…'; renderDialogActions(actions); if (!dialog.open) dialog.showModal(); }
function renderDialogActions(actions) { const root = document.querySelector('#dialog-actions'); root.replaceChildren(); for (const entry of actions) { const button = document.createElement('button'); button.textContent = entry.label; if (entry.className) button.className = entry.className; button.addEventListener('click', entry.action); root.append(button); } }
function closeDialog() { document.querySelector('#npc-dialog').close(); }
function acceptQuest(npc, quest) { const state = stateFor(npc, quest); state.accepted = true; activeQuestRef = { npcId: npc.id, questId: quest.id }; closeDialog(); renderQuestTracker(); toast(`Quest angenommen: ${quest.title}`); }
function allStepsDone(quest, state) { return quest.steps.every(step => state.steps.has(step.id) || step.optional); }
function finishQuest(npc, quest) { const state = stateFor(npc, quest); state.completed = true; activeQuestRef = null; showDialog(npc, [quest.completeText || 'Gut gemacht! Die Aufgabe ist erfüllt.'], [{ label: 'Belohnung erhalten', className: 'accept', action: () => { closeDialog(); renderQuestTracker(); toast(rewardText(quest)); } }]); }
function rewardText(quest) { const rewards = []; if (quest.rewards?.xp) rewards.push(`${quest.rewards.xp} XP (Platzhalter)`); if (quest.rewards?.gold) rewards.push(`${quest.rewards.gold} Gold (Platzhalter)`); if (quest.rewards?.item) rewards.push(quest.rewards.item); return rewards.length ? `Belohnung: ${rewards.join(' · ')}` : 'Quest abgeschlossen'; }

function completeMatchingStep(type, predicate) { const current = currentQuest(); if (!current) return; current.quest.steps.forEach(step => { if (step.type === type && predicate(step.target) && !current.state.steps.has(step.id)) { current.state.steps.add(step.id); toast(`Etappe geschafft: ${step.text}`); } }); renderQuestTracker(); }
function travelPortal(portal) { completeMatchingStep('portal', target => target?.portalId === portal.id); const target = sectionById(portal.targetSectionId); if (!target) return toast('Portalziel fehlt'); setSection(target.id, portal.targetX, portal.targetY); document.querySelector('#event-status').textContent = `Portal: ${portal.name}`; toast(`Angekommen in ${target.name}`); }
function updateLocationQuests() { const current = currentQuest(); if (!current) return; for (const step of current.quest.steps) { const target = step.target; if (step.type === 'location' && target?.sectionId === currentSection.id && !current.state.steps.has(step.id) && Math.hypot(target.x - player.x, target.y - (player.y + PLAYER_H)) < 55) { current.state.steps.add(step.id); toast(`Ort erreicht: ${step.text}`); renderQuestTracker(); } } }

function renderQuestTracker() {
  const root = document.querySelector('#quest-steps'), reward = document.querySelector('#reward-preview'); root.replaceChildren(); reward.hidden = true; const current = currentQuest();
  if (!current) { document.querySelector('#active-quest-title').textContent = 'Keine Quest aktiv'; document.querySelector('#active-quest-summary').textContent = npcs.length ? 'Sprich mit einem NPC, um eine Quest anzunehmen.' : 'In diesem Prototyp wurden keine Quests übergeben.'; return; }
  document.querySelector('#active-quest-title').textContent = current.quest.title; document.querySelector('#active-quest-summary').textContent = current.quest.summary || 'Erfülle alle Quest-Etappen.';
  for (const step of current.quest.steps) { const done = current.state.steps.has(step.id); const row = document.createElement('div'); row.className = `quest-step${done ? ' done' : ''}`; const mark = document.createElement('b'); mark.textContent = done ? '✓' : '○'; const text = document.createElement('span'); text.textContent = `${step.text}${step.amount > 1 ? ` · ${done ? step.amount : 0}/${step.amount}` : ''}`; row.append(mark, text); if (!done && ['collect','enemy'].includes(step.type)) { const button = document.createElement('button'); button.textContent = 'Simulieren'; button.addEventListener('click', () => { current.state.steps.add(step.id); renderQuestTracker(); toast(`${step.type === 'enemy' ? 'Gegner' : 'Sammeln'} simuliert`); }); row.append(button); } root.append(row); }
  reward.hidden = false; reward.textContent = rewardText(current.quest);
}

function updateFeatureList() {
  const features = [['Karte', Boolean(currentSection)], ['Kollision', Boolean(currentSection?.mapState.collision?.length)], ['Portale', Boolean(world?.portals?.length)], ['NPCs', Boolean(npcs.length)], ['Monster', Boolean(monsterSpawns.length)], ['Dialoge', npcs.some(npc => npc.dialogue?.length)], ['Quests', npcs.some(npc => npc.quests?.length)]]; const root = document.querySelector('#feature-list'); root.replaceChildren();
  for (const [label, available] of features) { const item = document.createElement('div'); item.className = `feature${available ? '' : ' missing'}`; item.textContent = label; root.append(item); } document.querySelector('#collision-status').textContent = `Kollisionen: ${currentSection?.mapState.collision?.length || 0}`;
}

function drawPlayer(cameraX, cameraY) {
  const x = player.x - cameraX, y = player.y - cameraY;
  if (!playerAtlas) { context.fillStyle = '#ffffff'; context.fillRect(Math.round(x), Math.round(y), PLAYER_W, PLAYER_H); return; }
  const anchorX = Math.round(x + PLAYER_W / 2), drawX = anchorX - 64, drawY = Math.round(y + PLAYER_H - 112); context.save(); context.imageSmoothingEnabled = false; if (player.facing < 0) { context.translate(anchorX * 2, 0); context.scale(-1, 1); } context.drawImage(playerAtlas, 0, 0, 128, 128, drawX, drawY, 128, 128); context.restore();
}
function draw() {
  if (!currentSection) return; const cameraX = Math.max(0, Math.min(mapWidth() - canvas.width, player.x + PLAYER_W / 2 - canvas.width / 2)), cameraY = Math.max(0, Math.min(mapHeight() - canvas.height, player.y + PLAYER_H / 2 - canvas.height / 2)); context.clearRect(0, 0, canvas.width, canvas.height); context.drawImage(sectionCanvas, cameraX, cameraY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
  for (const portal of (world.portals || []).filter(entry => entry.sectionId === currentSection.id)) { context.save(); context.shadowColor = '#58d5bf'; context.shadowBlur = 12; context.strokeStyle = '#70ead5'; context.lineWidth = 4; context.beginPath(); context.ellipse(portal.x - cameraX, portal.y - cameraY - 35, 25, 38, 0, 0, Math.PI * 2); context.stroke(); context.restore(); }
  for (const spawn of monsterSpawns.filter(entry => entry.sectionId === currentSection.id)) { const enemy = enemyTypes.find(entry => entry.id === spawn.enemyId), image = enemyImages.get(enemy?.id); if (!enemy || !image) continue; const amount = spawn.kind === 'zone' ? Math.min(3, spawn.max || 1) : 1; for (let i = 0; i < amount; i++) { const offset = spawn.kind === 'zone' ? (i - 1) * Math.min(55, (spawn.radius || 96) / 3) : 0, x = spawn.x + offset - cameraX, y = spawn.y - cameraY, frame = enemy.frame || image.height; context.drawImage(image, 0, 0, frame, image.height, Math.round(x - 36), Math.round(y - 68), 72, 72); context.fillStyle = enemy.type === 'Boss' ? '#e9b95f' : '#8fcf72'; context.fillRect(Math.round(x - 28), Math.round(y - 76), 56, 4); context.font = "12px 'Idlekin'"; context.textAlign = 'center'; context.fillStyle = '#eef4e9'; context.fillText(enemy.name, Math.round(x), Math.round(y - 82)); } }
  if (npcAtlas) for (const npc of npcs.filter(entry => entry.sectionId === currentSection.id)) { const sprite = npc.sprite || {}, x = npc.x - cameraX, y = npc.y - cameraY; context.drawImage(npcAtlas, (sprite.col || 0) * 64, (sprite.row || 0) * 64, 64, 64, Math.round(x - 32), Math.round(y - 64), 64, 64); const quest = nextQuestForNpc(npc), marker = quest ? (stateFor(npc, quest).accepted ? '?' : '!') : '✓'; context.font = "22px 'Idlekin'"; context.textAlign = 'center'; context.fillStyle = marker === '✓' ? '#82cf80' : '#ffe174'; context.fillText(marker, x, y - 67); } context.textAlign = 'left'; drawPlayer(cameraX, cameraY);
}
function loop(now) { accumulator += Math.min(.1, (now - lastTime) / 1000); lastTime = now; while (accumulator >= STEP) { update(STEP); accumulator -= STEP; } draw(); requestAnimationFrame(loop); }
function toast(message) { const element = document.querySelector('#toast'); element.textContent = message; element.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('show'), 1900); }
function resetTest() { progress.clear(); activeQuestRef = null; const spawn = world?.spawn, section = sectionById(spawn?.sectionId) || world?.sections[0]; if (section) setSection(section.id, spawn?.x || 64, spawn?.y || 64); renderQuestTracker(); toast('Testfortschritt zurückgesetzt'); }

async function init() {
  const data = normalise(readPayload()); document.querySelector('#empty-state').hidden = Boolean(data); if (!data) { updateFeatureList(); return; }
  enemyTypes = clone(data.payload.project?.enemies || []); monsterSpawns = clone(data.payload.project?.spawns || []);
  payload = data.payload; world = data.world; npcs = data.npcs; document.querySelector('#source-name').textContent = payload.label || `Prototyp ${payload.source}`; document.querySelector('#world-name').textContent = world.name || 'Testwelt'; const back = document.querySelector('#back-to-editor'); back.href = payload.returnUrl || '/prototypes/'; back.textContent = `Zurück zu Prototyp ${payload.source || ''}`;
  [playerAtlas, npcAtlas] = await Promise.all([imageFrom('../../assets/player/Final Player/toUse.png').catch(() => null), imageFrom('../../assets/npc/Generic Male NPCs.png').catch(() => null)]);
  await Promise.all(enemyTypes.map(async enemy => { try { enemyImages.set(enemy.id, await imageFrom(`../../assets/enemy/Monsters%20Creatures%20Fantasy%202/${enemy.sprite}`)); } catch {} })); resetTest(); renderQuestTracker();
  document.querySelector('#restart').addEventListener('click', resetTest);
  window.addEventListener('keydown', event => { if (document.querySelector('#npc-dialog').open) return; keys.add(event.code); if (['Space','ArrowUp','ArrowDown'].includes(event.code)) event.preventDefault(); if ((event.code === 'Space' || event.code === 'KeyW' || event.code === 'ArrowUp') && player.grounded) { player.vy = -JUMP; player.grounded = false; } if (event.code === 'KeyE') interact(); if (event.code === 'KeyR') resetTest(); });
  window.addEventListener('keyup', event => keys.delete(event.code)); requestAnimationFrame(loop);
}
init();
