const TILE_SIZE = 32;
const WORLD_STORAGE_KEY = 'idlekin.prototype03.world.v1';
const PROJECT_STORAGE_KEY = 'idlekin.prototype04.quests.v1';
const PLAYTEST_KEY = 'idlekin.playtest.payload.v1';
const WORLD_WIDTH = 8000;
const WORLD_HEIGHT = 4800;
const SHEETS = ['Tileset.png', 'Objects.png', 'Details.png', 'cave_entrance.png', 'chest.png', 'Clouds_in_tiles.png', 'Fairys.png', 'Flying_stone.png', 'key.png', 'Predator_plant.png', 'shinies.png', 'Spikes.png', 'stalactites.png'];
const BACKGROUNDS = ['Full_bgx32.png', 'Skyx32.png', 'Clouds_x32.png', 'Flora2x32.png', 'Flora1x32.png'];
const STEP_TYPES = {
  portal: { label: 'Portal durchqueren', target: 'portal', help: 'Klicke das Portal an, das der Spieler durchqueren soll.' },
  location: { label: 'Ort erreichen', target: 'location', help: 'Klicke die genaue Stelle in einem Kartenabschnitt an.' },
  npc: { label: 'Mit NPC sprechen', target: 'npc', help: 'Klicke einen anderen NPC in der Welt an.' },
  collect: { label: 'Gegenstand sammeln', target: 'placeholder', help: 'Das Inventar-System wird später angeschlossen.' },
  enemy: { label: 'Gegner besiegen', target: 'placeholder', help: 'Gegner und Kampf werden später angeschlossen.' },
};
const NPC_PRESETS = [
  { id: 'villager', name: 'Milo', role: 'Dorfbewohner', description: 'Ein freundlicher Bewohner, der die Gegend und ihre kleinen Geheimnisse kennt.', col: 0, row: 0 },
  { id: 'ranger', name: 'Fenrik', role: 'Waldläufer', description: 'Ein wachsamer Kundschafter mit Geschichten von seltsamen Spuren im Wald.', col: 3, row: 0 },
  { id: 'knight', name: 'Ser Alric', role: 'Ritter', description: 'Ein pflichtbewusster Ritter, der Reisende vor nahenden Gefahren warnt.', col: 6, row: 0 },
  { id: 'guardian', name: 'Torwächter Brann', role: 'Schwerer Wächter', description: 'Der schweigsame Wächter eines Ortes, den nicht jeder betreten darf.', col: 9, row: 0 },
  { id: 'elder', name: 'Eldrin', role: 'Dorfältester', description: 'Ein weiser Ältester, der sich an vergessene Wege und alte Versprechen erinnert.', col: 0, row: 4 },
  { id: 'mystic', name: 'Orven', role: 'Mystiker', description: 'Ein rätselhafter Gelehrter, der die Energie der Portale untersucht.', col: 3, row: 4 },
  { id: 'merchant', name: 'Boros', role: 'Händler', description: 'Ein reisender Händler, dessen Lieferung unter merkwürdigen Umständen verschwand.', col: 6, row: 4 },
  { id: 'noble', name: 'Lord Edric', role: 'Adliger', description: 'Ein einflussreicher Auftraggeber mit größeren Plänen für diese Welt.', col: 9, row: 4 },
];

const viewport = document.querySelector('#viewport');
const worldElement = document.querySelector('#world');
const imageCache = new Map();
let project = { version: 1, world: null, npcs: [] };
let selectedNpcId = null;
let selectedQuestId = null;
let tool = 'select';
let zoom = .4;
let sequence = 1;
let targetPick = null;
let drag = null;
let pan = null;
let toastTimer = 0;

function clone(value) { return structuredClone(value); }
function id(prefix) { return `${prefix}-${Date.now().toString(36)}-${sequence++}`; }
function integer(value) { return Math.round(Number(value) || 0); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
function sectionById(sectionId) { return project.world?.sections.find(section => section.id === sectionId); }
function npcById(npcId) { return project.npcs.find(npc => npc.id === npcId); }
function selectedNpc() { return npcById(selectedNpcId); }
function selectedQuest() { return selectedNpc()?.quests.find(quest => quest.id === selectedQuestId); }
function mapWidth(section) { return section.mapState.map.columns * TILE_SIZE; }
function mapHeight(section) { return section.mapState.map.rows * TILE_SIZE; }
function totalQuests() { return project.npcs.reduce((sum, npc) => sum + npc.quests.length, 0); }
function cleanWorld(value) {
  if (!value || !Array.isArray(value.sections) || !Array.isArray(value.portals)) throw new Error('Ungültiges Weltformat');
  return { version: value.version || 2, name: String(value.name || 'Meine Welt'), sections: clone(value.sections), portals: clone(value.portals), spawn: value.spawn ? clone(value.spawn) : null };
}

function newStep(index) {
  return { id: id('step'), type: index ? 'location' : 'portal', text: index ? 'Erreiche den markierten Ort' : 'Durchquere das Portal', amount: 1, target: null, optional: false };
}

function newQuest(index) {
  return { id: id('quest'), title: `Quest ${index + 1}`, summary: '', steps: [newStep(0)], rewards: { xp: 0, gold: 0, item: '' }, completeText: '', optional: false };
}

function newNpc(preset = NPC_PRESETS[0]) {
  const number = project.npcs.length + 1;
  return { id: id('npc'), presetId: preset.id, sprite: { col: preset.col, row: preset.row }, name: preset.name || `Neuer NPC ${number}`, role: preset.role || 'Questgeber', description: preset.description || '', sectionId: null, x: 0, y: 0, dialogue: ['Hallo, Reisender.', 'Ich hätte eine wichtige Aufgabe für dich.'], offerText: 'Nimmst du die Quest an?', quests: [newQuest(0)] };
}

function applySprite(element, npcOrPreset) {
  const sprite = npcOrPreset.sprite || npcOrPreset;
  element.style.setProperty('--sprite-x', `${-64 * (Number(sprite.col) || 0)}px`);
  element.style.setProperty('--sprite-y', `${-64 * (Number(sprite.row) || 0)}px`);
}

function imageFrom(src) {
  if (!imageCache.has(src)) imageCache.set(src, new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; }));
  return imageCache.get(src);
}

async function mapPreview(state, canvas) {
  const width = state.map.columns * TILE_SIZE, height = state.map.rows * TILE_SIZE;
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d'); context.imageSmoothingEnabled = false; context.fillStyle = '#111722'; context.fillRect(0, 0, width, height);
  if (state.map.background && BACKGROUNDS.includes(state.map.background)) try { context.drawImage(await imageFrom(`../../assets/tileset/PNG/Background/x32/${state.map.background}`), 0, 0, width, height); } catch {}
  for (const layer of state.layers || []) {
    if (layer.visible === false || !Array.isArray(layer.placements)) continue;
    for (const placement of layer.placements) {
      if (!SHEETS.includes(placement.sheet)) continue;
      try { const image = await imageFrom(`../../assets/tileset/PNG/${placement.sheet}`); context.drawImage(image, placement.sourceX * TILE_SIZE, placement.sourceY * TILE_SIZE, placement.width * TILE_SIZE, placement.height * TILE_SIZE, placement.x * TILE_SIZE, placement.y * TILE_SIZE, placement.width * TILE_SIZE, placement.height * TILE_SIZE); } catch {}
    }
  }
}

function createPortalElement(portal) {
  const element = document.createElement('button');
  element.className = `portal${targetPick?.kind === 'portal' ? ' target-valid' : ''}`;
  Object.assign(element.style, { left: `${portal.x}px`, top: `${portal.y}px` });
  element.type = 'button'; element.title = portal.name;
  const label = document.createElement('span'); label.className = 'portal-name'; label.textContent = portal.name; element.append(label);
  element.addEventListener('pointerdown', event => {
    event.stopPropagation();
    if (targetPick?.kind !== 'portal') return;
    applyTarget({ kind: 'portal', portalId: portal.id, sectionId: portal.sectionId, label: portal.name });
  });
  return element;
}

function createNpcElement(npc) {
  const element = document.createElement('button');
  element.type = 'button'; element.className = `npc-marker${selectedNpcId === npc.id ? ' selected' : ''}`;
  applySprite(element, npc);
  Object.assign(element.style, { left: `${npc.x}px`, top: `${npc.y}px` });
  const mark = document.createElement('span'); mark.className = 'quest-mark'; mark.textContent = npc.quests.length ? '!' : '·';
  const label = document.createElement('span'); label.className = 'npc-nameplate'; label.textContent = npc.name; element.append(mark, label);
  element.addEventListener('pointerdown', event => {
    event.stopPropagation();
    if (targetPick?.kind === 'npc') { if (npc.id === selectedNpcId) return toast('Wähle einen anderen NPC'); applyTarget({ kind: 'npc', npcId: npc.id, label: npc.name }); return; }
    selectedNpcId = npc.id; selectedQuestId ||= npc.quests[0]?.id || null; renderAll();
    if (tool === 'select') { drag = { npcId: npc.id, startX: event.clientX, startY: event.clientY, x: npc.x, y: npc.y }; element.setPointerCapture?.(event.pointerId); }
  });
  return element;
}

function createSectionElement(section) {
  const element = document.createElement('article');
  element.className = `section${targetPick?.kind === 'location' ? ' target-valid' : ''}`;
  element.dataset.id = section.id;
  Object.assign(element.style, { left: `${section.x}px`, top: `${section.y}px`, width: `${mapWidth(section)}px`, height: `${mapHeight(section)}px` });
  const canvas = document.createElement('canvas'); const label = document.createElement('span'); label.className = 'section-label'; label.textContent = section.name; element.append(canvas, label); mapPreview(section.mapState, canvas);
  if (document.querySelector('#show-portals').checked) for (const portal of project.world.portals.filter(entry => entry.sectionId === section.id)) element.append(createPortalElement(portal));
  for (const npc of project.npcs.filter(entry => entry.sectionId === section.id)) element.append(createNpcElement(npc));
  element.addEventListener('pointerdown', event => sectionPointerDown(event, section, element));
  return element;
}

function localPoint(event, element, section) {
  const bounds = element.getBoundingClientRect();
  return { x: clamp(integer((event.clientX - bounds.left) / bounds.width * mapWidth(section)), 0, mapWidth(section)), y: clamp(integer((event.clientY - bounds.top) / bounds.height * mapHeight(section)), 0, mapHeight(section)) };
}

function sectionPointerDown(event, section, element) {
  if (targetPick?.kind === 'location') { event.stopPropagation(); const point = localPoint(event, element, section); applyTarget({ kind: 'location', sectionId: section.id, x: point.x, y: point.y, label: `${section.name} · ${point.x}, ${point.y}` }); return; }
  if (tool === 'npc') {
    event.stopPropagation(); const npc = selectedNpc(); if (!npc) return toast('Lege zuerst einen NPC an'); const point = localPoint(event, element, section);
    npc.sectionId = section.id; npc.x = point.x; npc.y = point.y; setTool('select'); markDirty(); renderAll(); toast(`${npc.name} platziert`); return;
  }
  if (tool === 'pan') { pan = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop }; viewport.style.cursor = 'grabbing'; element.setPointerCapture?.(event.pointerId); }
}

function renderWorld() {
  worldElement.querySelectorAll('.section').forEach(element => element.remove());
  document.querySelector('#world-name').textContent = project.world?.name || 'Keine Welt geladen';
  document.querySelector('#empty-world').hidden = Boolean(project.world?.sections.length);
  if (project.world) for (const section of project.world.sections) worldElement.append(createSectionElement(section));
  document.querySelector('#status-count').textContent = `${project.npcs.length} NPC${project.npcs.length === 1 ? '' : 's'} · ${totalQuests()} Quest${totalQuests() === 1 ? '' : 's'}`;
}

function renderNpcList() {
  const root = document.querySelector('#npc-list'); root.replaceChildren();
  if (!project.npcs.length) { const empty = document.createElement('div'); empty.className = 'empty-list'; empty.textContent = 'Noch keine NPCs. Klicke oben auf +.'; root.append(empty); return; }
  for (const npc of project.npcs) {
    const button = document.createElement('button'); button.type = 'button'; button.className = `npc-card${npc.id === selectedNpcId ? ' active' : ''}`;
    const avatar = document.createElement('span'); avatar.className = 'npc-avatar'; applySprite(avatar, npc);
    const info = document.createElement('span'); const name = document.createElement('strong'); name.textContent = npc.name; const meta = document.createElement('span'); meta.textContent = npc.sectionId ? `${npc.role} · platziert` : `${npc.role} · nicht platziert`; info.append(name, meta);
    const count = document.createElement('b'); count.textContent = npc.quests.length; button.append(avatar, info, count);
    button.addEventListener('click', () => { selectedNpcId = npc.id; selectedQuestId = npc.quests.some(quest => quest.id === selectedQuestId) ? selectedQuestId : npc.quests[0]?.id || null; renderAll(); });
    root.append(button);
  }
}

function renderDialogue(npc) {
  const root = document.querySelector('#dialogue-list'); root.replaceChildren();
  npc.dialogue.forEach((line, index) => {
    const row = document.createElement('div'); row.className = 'dialogue-row'; const number = document.createElement('b'); number.textContent = index + 1;
    const input = document.createElement('input'); input.value = line; input.maxLength = 160; input.placeholder = `Dialogzeile ${index + 1}`; input.addEventListener('input', () => { npc.dialogue[index] = input.value; markDirty(); });
    const remove = document.createElement('button'); remove.className = 'remove-icon'; remove.textContent = '×'; remove.title = 'Text entfernen'; remove.addEventListener('click', () => { npc.dialogue.splice(index, 1); renderDialogue(npc); markDirty(); });
    row.append(number, input, remove); root.append(row);
  });
}

function targetText(step) { return step.target?.label || (STEP_TYPES[step.type].target === 'placeholder' ? 'Wird später über Spielsystem ausgewählt' : 'Noch kein Ziel gewählt'); }

function renderSteps(quest) {
  const root = document.querySelector('#step-list'); root.replaceChildren();
  quest.steps.forEach((step, index) => {
    const card = document.createElement('article'); card.className = 'step-card';
    const top = document.createElement('div'); top.className = 'step-top'; const number = document.createElement('span'); number.textContent = index + 1;
    const text = document.createElement('input'); text.value = step.text; text.maxLength = 120; text.placeholder = 'Was soll der Spieler tun?'; text.addEventListener('input', () => { step.text = text.value; markDirty(); });
    const remove = document.createElement('button'); remove.className = 'remove-icon'; remove.textContent = '×'; remove.title = 'Etappe entfernen'; remove.disabled = quest.steps.length === 1; remove.addEventListener('click', () => { quest.steps.splice(index, 1); renderSteps(quest); markDirty(); }); top.append(number, text, remove);
    const fields = document.createElement('div'); fields.className = 'step-fields';
    const type = document.createElement('select'); for (const [value, config] of Object.entries(STEP_TYPES)) type.add(new Option(config.label, value)); type.value = step.type;
    type.addEventListener('change', () => { step.type = type.value; step.target = null; step.amount = 1; renderSteps(quest); markDirty(); });
    const amount = document.createElement('input'); amount.type = 'number'; amount.min = 1; amount.value = step.amount || 1; amount.title = 'Benötigte Anzahl'; amount.addEventListener('input', () => { step.amount = Math.max(1, integer(amount.value)); markDirty(); }); fields.append(type, amount);
    card.append(top, fields);
    const config = STEP_TYPES[step.type];
    if (config.target === 'placeholder') { const note = document.createElement('div'); note.className = 'placeholder-note'; note.textContent = `${step.type === 'enemy' ? 'GEGNER' : 'INVENTAR'}-PLATZHALTER · Zielname kann vorläufig im Aufgabentext stehen.`; card.append(note); }
    else {
      const row = document.createElement('div'); row.className = 'target-row'; const value = document.createElement('div'); value.className = `target-value${step.target ? ' set' : ''}`; value.textContent = targetText(step);
      const choose = document.createElement('button'); choose.textContent = step.target ? 'Ziel ändern' : 'Ziel wählen'; choose.addEventListener('click', () => beginTarget(step, config)); row.append(value, choose); card.append(row);
    }
    root.append(card);
  });
}

function renderInspector() {
  const npc = selectedNpc(); document.querySelector('#nothing-selected').hidden = Boolean(npc); document.querySelector('#npc-editor').hidden = !npc; if (!npc) return;
  document.querySelector('#inspector-title').textContent = npc.name; document.querySelector('#npc-name').value = npc.name; document.querySelector('#npc-role').value = npc.role; document.querySelector('#npc-description').value = npc.description; document.querySelector('#npc-offer-text').value = npc.offerText;
  const section = sectionById(npc.sectionId); document.querySelector('#npc-position').textContent = section ? `${section.name} · ${npc.x}, ${npc.y}` : 'Noch nicht platziert'; renderDialogue(npc);
  document.querySelector('#quest-count-badge').textContent = npc.quests.length;
  const select = document.querySelector('#quest-select'); select.replaceChildren(); npc.quests.forEach((quest, index) => select.add(new Option(`${index + 1}. ${quest.title}`, quest.id)));
  if (!npc.quests.some(quest => quest.id === selectedQuestId)) selectedQuestId = npc.quests[0]?.id || null; select.value = selectedQuestId || '';
  const quest = selectedQuest(); document.querySelector('#no-quest').hidden = Boolean(quest); document.querySelector('#quest-editor').hidden = !quest; if (!quest) return;
  document.querySelector('#quest-number').textContent = `QUEST ${npc.quests.indexOf(quest) + 1} VON ${npc.quests.length}`; document.querySelector('#quest-title').value = quest.title; document.querySelector('#quest-summary').value = quest.summary; document.querySelector('#reward-xp').value = quest.rewards.xp; document.querySelector('#reward-gold').value = quest.rewards.gold; document.querySelector('#reward-item').value = quest.rewards.item; document.querySelector('#quest-complete-text').value = quest.completeText; document.querySelector('#quest-optional').checked = quest.optional; renderSteps(quest);
}

function renderAll() { renderNpcList(); renderWorld(); renderInspector(); }
function markDirty() { document.querySelector('#save-state').textContent = 'Nicht gespeichert'; }
function toast(message) { const element = document.querySelector('#toast'); element.textContent = message; element.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('show'), 1900); }

function setTool(next) {
  tool = next; document.querySelectorAll('.tool').forEach(button => button.classList.toggle('active', button.dataset.tool === tool));
  document.querySelector('#status-tool').textContent = { select: 'Auswählen', npc: 'NPC platzieren', pan: 'Hand' }[tool]; viewport.style.cursor = tool === 'pan' ? 'grab' : 'default';
}

function beginTarget(step, config) {
  targetPick = { npcId: selectedNpcId, questId: selectedQuestId, stepId: step.id, kind: config.target };
  document.querySelector('#target-title').textContent = config.label; document.querySelector('#target-help').textContent = config.help; document.querySelector('#target-banner').hidden = false; renderWorld();
}

function cancelTarget() { targetPick = null; document.querySelector('#target-banner').hidden = true; renderWorld(); }
function applyTarget(value) {
  const npc = npcById(targetPick?.npcId), quest = npc?.quests.find(entry => entry.id === targetPick.questId), step = quest?.steps.find(entry => entry.id === targetPick.stepId); if (!step) return cancelTarget();
  step.target = value; targetPick = null; document.querySelector('#target-banner').hidden = true; markDirty(); renderAll(); toast(`Ziel gewählt: ${value.label}`);
}

function loadWorldFromPrototype() {
  try {
    const saved = JSON.parse(localStorage.getItem(WORLD_STORAGE_KEY) || 'null'); if (!saved?.world) throw new Error('Speichere zuerst eine Welt in Prototyp 03.');
    project.world = cleanWorld(saved.world);
    const sectionIds = new Set(project.world.sections.map(section => section.id)); for (const npc of project.npcs) if (npc.sectionId && !sectionIds.has(npc.sectionId)) npc.sectionId = null;
    markDirty(); renderAll(); centerWorld(); toast(`Welt „${project.world.name}“ geladen`);
  } catch (error) { toast(error.message || 'Keine gespeicherte Welt gefunden'); }
}

function renderPresetList() {
  const root = document.querySelector('#preset-list'); root.replaceChildren();
  for (const preset of NPC_PRESETS) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'preset-card';
    const sprite = document.createElement('span'); sprite.className = 'preset-sprite'; applySprite(sprite, preset);
    const name = document.createElement('strong'); name.textContent = preset.name;
    const role = document.createElement('span'); role.textContent = preset.role;
    button.append(sprite, name, role);
    button.addEventListener('click', () => {
      const npc = newNpc(preset); project.npcs.push(npc); selectedNpcId = npc.id; selectedQuestId = npc.quests[0].id;
      document.querySelector('#preset-dialog').close(); markDirty(); renderAll();
      if (project.world) { setTool('npc'); toast(`${npc.name} ausgewählt – jetzt in der Welt platzieren`); }
      else toast(`${npc.name} angelegt – lade jetzt eine Welt`);
    });
    root.append(button);
  }
}

function saveProject() {
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify({ updatedAt: Date.now(), project })); document.querySelector('#save-state').textContent = 'Lokal gespeichert'; toast('Questprojekt gespeichert');
}

function playCurrentProject() {
  if (!project.world?.sections.length) return toast('Lade zuerst eine Welt aus Prototyp 03');
  localStorage.setItem(PLAYTEST_KEY, JSON.stringify({ source: '04', label: project.world.name || 'Aktuelles Questprojekt', returnUrl: '../04-npc-quest-editor/', project: clone(project) }));
  location.href = '../01-side-view-movement/';
}

function restoreProject(value) {
  if (!value || !Array.isArray(value.npcs)) throw new Error('Ungültiges Questprojekt');
  project = { version: 1, world: value.world ? cleanWorld(value.world) : null, npcs: clone(value.npcs) }; selectedNpcId = project.npcs[0]?.id || null; selectedQuestId = project.npcs[0]?.quests[0]?.id || null; cancelTarget(); renderAll(); centerWorld();
}

function openLoadDialog() {
  const root = document.querySelector('#saved-project'); root.replaceChildren();
  try {
    const saved = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || 'null'); if (!saved?.project) throw new Error();
    const card = document.createElement('article'); card.className = 'saved-card'; const info = document.createElement('div'); const title = document.createElement('strong'); title.textContent = saved.project.world?.name || 'Questprojekt'; const meta = document.createElement('span'); meta.textContent = `${saved.project.npcs.length} NPCs · ${saved.project.npcs.reduce((sum, npc) => sum + npc.quests.length, 0)} Quests · ${new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(saved.updatedAt)}`; info.append(title, document.createElement('br'), meta); const button = document.createElement('button'); button.textContent = 'Projekt laden'; button.addEventListener('click', () => { restoreProject(saved.project); document.querySelector('#load-dialog').close(); toast('Questprojekt geladen'); }); card.append(info, button); root.append(card);
  } catch { const empty = document.createElement('div'); empty.className = 'empty-list'; empty.textContent = 'Noch kein Questprojekt gespeichert.'; root.append(empty); }
  document.querySelector('#load-dialog').showModal();
}

function exportProject() {
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })); link.download = `${(project.world?.name || 'idlekin').replace(/[^a-z0-9äöüß-]+/gi, '-').toLowerCase()}-quests.json`; link.click(); URL.revokeObjectURL(link.href); toast('Questprojekt exportiert');
}

function centerWorld() {
  if (!project.world?.sections.length) return viewport.scrollTo({ left: WORLD_WIDTH * zoom / 2 - viewport.clientWidth / 2, top: WORLD_HEIGHT * zoom / 2 - viewport.clientHeight / 2 });
  const sections = project.world.sections, left = Math.min(...sections.map(s => s.x)), right = Math.max(...sections.map(s => s.x + mapWidth(s))), top = Math.min(...sections.map(s => s.y)), bottom = Math.max(...sections.map(s => s.y + mapHeight(s)));
  viewport.scrollTo({ left: ((left + right) / 2) * zoom - viewport.clientWidth / 2, top: ((top + bottom) / 2) * zoom - viewport.clientHeight / 2, behavior: 'smooth' });
}

function bindInput(selector, property, source = selectedNpc) { document.querySelector(selector).addEventListener('input', event => { const object = source(); if (!object) return; object[property] = event.target.type === 'checkbox' ? event.target.checked : event.target.value; markDirty(); if (selector === '#npc-name' || selector === '#npc-role') renderNpcList(); if (selector === '#npc-name') { document.querySelector('#inspector-title').textContent = object.name; renderWorld(); } }); }
function bindReward(selector, property) { document.querySelector(selector).addEventListener('input', event => { const quest = selectedQuest(); if (!quest) return; quest.rewards[property] = event.target.type === 'number' ? Math.max(0, integer(event.target.value)) : event.target.value; markDirty(); }); }

function bindEvents() {
  document.querySelectorAll('.tool').forEach(button => button.addEventListener('click', () => { cancelTarget(); setTool(button.dataset.tool); }));
  document.querySelector('#zoom').addEventListener('change', event => { zoom = Number(event.target.value); worldElement.style.zoom = zoom; });
  document.querySelector('#show-portals').addEventListener('change', renderWorld); document.querySelector('#center-world').addEventListener('click', centerWorld); document.querySelector('#cancel-target').addEventListener('click', cancelTarget);
  document.querySelector('#refresh-world').addEventListener('click', loadWorldFromPrototype); document.querySelector('#save-project').addEventListener('click', saveProject); document.querySelector('#load-project').addEventListener('click', openLoadDialog); document.querySelector('#close-dialog').addEventListener('click', () => document.querySelector('#load-dialog').close()); document.querySelector('#export-project').addEventListener('click', exportProject);
  document.querySelector('#play-project').addEventListener('click', playCurrentProject);
  document.querySelector('#import-project').addEventListener('click', () => document.querySelector('#import-file').click()); document.querySelector('#import-file').addEventListener('change', async event => { const [file] = event.target.files; if (!file) return; try { restoreProject(JSON.parse(await file.text())); markDirty(); toast('Questprojekt importiert'); } catch (error) { toast(error.message); } event.target.value = ''; });
  document.querySelector('#new-npc').addEventListener('click', () => document.querySelector('#preset-dialog').showModal());
  document.querySelector('#close-presets').addEventListener('click', () => document.querySelector('#preset-dialog').close());
  document.querySelector('#delete-npc').addEventListener('click', () => { const npc = selectedNpc(); if (!npc || !confirm(`„${npc.name}“ mit allen Quests löschen?`)) return; project.npcs = project.npcs.filter(entry => entry.id !== npc.id); selectedNpcId = project.npcs[0]?.id || null; selectedQuestId = project.npcs[0]?.quests[0]?.id || null; markDirty(); renderAll(); });
  document.querySelector('#place-selected-npc').addEventListener('click', () => { if (!project.world) return toast('Lade zuerst eine Welt'); setTool('npc'); toast('Klicke die gewünschte Position in der Welt an'); });
  document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab === button)); document.querySelector('#tab-npc').hidden = button.dataset.tab !== 'npc'; document.querySelector('#tab-quests').hidden = button.dataset.tab !== 'quests'; }));
  bindInput('#npc-name', 'name'); bindInput('#npc-role', 'role'); bindInput('#npc-description', 'description'); bindInput('#npc-offer-text', 'offerText');
  document.querySelector('#add-dialogue').addEventListener('click', () => { const npc = selectedNpc(); if (!npc) return; npc.dialogue.push(''); renderDialogue(npc); markDirty(); });
  document.querySelector('#quest-select').addEventListener('change', event => { selectedQuestId = event.target.value; renderInspector(); });
  document.querySelector('#add-quest').addEventListener('click', () => { const npc = selectedNpc(); if (!npc) return; const quest = newQuest(npc.quests.length); npc.quests.push(quest); selectedQuestId = quest.id; markDirty(); renderAll(); });
  document.querySelector('#delete-quest').addEventListener('click', () => { const npc = selectedNpc(), quest = selectedQuest(); if (!npc || !quest || !confirm(`Quest „${quest.title}“ löschen?`)) return; npc.quests = npc.quests.filter(entry => entry.id !== quest.id); selectedQuestId = npc.quests[0]?.id || null; markDirty(); renderAll(); });
  bindInput('#quest-title', 'title', selectedQuest); bindInput('#quest-summary', 'summary', selectedQuest); bindInput('#quest-complete-text', 'completeText', selectedQuest); bindInput('#quest-optional', 'optional', selectedQuest); bindReward('#reward-xp', 'xp'); bindReward('#reward-gold', 'gold'); bindReward('#reward-item', 'item');
  document.querySelector('#add-step').addEventListener('click', () => { const quest = selectedQuest(); if (!quest) return; quest.steps.push(newStep(quest.steps.length)); renderSteps(quest); markDirty(); });
  worldElement.addEventListener('pointermove', event => {
    if (drag) { const npc = npcById(drag.npcId); if (!npc) return; npc.x = clamp(integer(drag.x + (event.clientX - drag.startX) / zoom), 0, mapWidth(sectionById(npc.sectionId))); npc.y = clamp(integer(drag.y + (event.clientY - drag.startY) / zoom), 0, mapHeight(sectionById(npc.sectionId))); const element = worldElement.querySelector('.npc-marker.selected'); if (element) Object.assign(element.style, { left: `${npc.x}px`, top: `${npc.y}px` }); }
    if (pan) { viewport.scrollLeft = pan.left - (event.clientX - pan.x); viewport.scrollTop = pan.top - (event.clientY - pan.y); }
  });
  worldElement.addEventListener('pointerup', () => { if (drag) { drag = null; markDirty(); renderInspector(); } if (pan) { pan = null; viewport.style.cursor = 'grab'; } });
  window.addEventListener('keydown', event => { if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return; if (event.key === 'Escape') cancelTarget(); if (event.key === ' ') { event.preventDefault(); setTool('pan'); } const shortcut = { v: 'select', n: 'npc', h: 'pan' }[event.key.toLowerCase()]; if (shortcut) setTool(shortcut); });
}

function init() {
  bindEvents(); renderPresetList(); worldElement.style.zoom = zoom;
  try { const saved = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || 'null'); if (saved?.project) restoreProject(saved.project); else loadWorldFromPrototype(); } catch { loadWorldFromPrototype(); }
  renderAll(); setTimeout(centerWorld, 100);
}

init();
