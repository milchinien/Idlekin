const TILE_SIZE = 32;
const MAP_LIBRARY_KEY = 'idlekin.prototype02.maps.v1';
const WORLD_STORAGE_KEY = 'idlekin.prototype03.world.v1';
const WORLD_WIDTH = 8000;
const WORLD_HEIGHT = 4800;
const MAX_HISTORY = 60;
const PLAYTEST_KEY = 'idlekin.playtest.payload.v1';
const SHEETS = ['Tileset.png', 'Objects.png', 'Details.png', 'cave_entrance.png', 'chest.png', 'Clouds_in_tiles.png', 'Fairys.png', 'Flying_stone.png', 'key.png', 'Predator_plant.png', 'shinies.png', 'Spikes.png', 'stalactites.png'];
const BACKGROUNDS = ['Full_bgx32.png', 'Skyx32.png', 'Clouds_x32.png', 'Flora2x32.png', 'Flora1x32.png'];

const viewport = document.querySelector('#viewport');
const worldElement = document.querySelector('#world');
const linksElement = document.querySelector('#portal-links');
const imageCache = new Map();
let world = { version: 2, name: 'Meine Welt', sections: [], portals: [], spawn: null };
let selected = null;
let tool = 'select';
let previousTool = null;
let zoom = .35;
let sequence = 1;
let drag = null;
let itemDrag = null;
let pan = null;
let toastTimer = 0;
let history = [];

function clone(value) { return structuredClone(value); }
function nextId(prefix) { return `${prefix}-${Date.now().toString(36)}-${sequence++}`; }
function sectionById(id) { return world.sections.find(section => section.id === id); }
function portalById(id) { return world.portals.find(portal => portal.id === id); }
function mapWidth(section) { return section.mapState.map.columns * TILE_SIZE; }
function mapHeight(section) { return section.mapState.map.rows * TILE_SIZE; }
function snap(value) { return Math.round(Number(value) / TILE_SIZE) * TILE_SIZE; }
function integer(value) { return Math.round(Number(value) || 0); }
function placementStep() { return document.querySelector('#snap-grid').checked ? Number(document.querySelector('#snap-size').value) : 1; }
function place(value) { const step = placementStep(); return Math.round(Number(value) / step) * step; }
function clamp(value, minimum, maximum) { return Math.max(minimum, Math.min(maximum, Number(value) || 0)); }

function readMapLibrary() {
  try {
    const value = JSON.parse(localStorage.getItem(MAP_LIBRARY_KEY) || '[]');
    return Array.isArray(value) ? value.filter(entry => entry?.state?.map && Array.isArray(entry.state.layers)) : [];
  } catch { return []; }
}

function imageFrom(src) {
  if (!imageCache.has(src)) {
    imageCache.set(src, new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Bild konnte nicht geladen werden: ${src}`));
      image.src = src;
    }));
  }
  return imageCache.get(src);
}

async function mapPreview(state, canvas) {
  const width = state.map.columns * TILE_SIZE;
  const height = state.map.rows * TILE_SIZE;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false;
  context.fillStyle = '#111722';
  context.fillRect(0, 0, width, height);
  if (state.map.background && BACKGROUNDS.includes(state.map.background)) {
    try {
      const image = await imageFrom(`../../assets/tileset/PNG/Background/x32/${state.map.background}`);
      context.drawImage(image, 0, 0, width, height);
    } catch { /* Ein fehlender Hintergrund blockiert den Rest nicht. */ }
  }
  for (const layer of state.layers) {
    if (layer.visible === false || !Array.isArray(layer.placements)) continue;
    for (const placement of layer.placements) {
      if (!SHEETS.includes(placement.sheet)) continue;
      try {
        const image = await imageFrom(`../../assets/tileset/PNG/${placement.sheet}`);
        context.drawImage(image, placement.sourceX * TILE_SIZE, placement.sourceY * TILE_SIZE, placement.width * TILE_SIZE, placement.height * TILE_SIZE, placement.x * TILE_SIZE, placement.y * TILE_SIZE, placement.width * TILE_SIZE, placement.height * TILE_SIZE);
      } catch { /* Einzelne fehlende Texturen werden übersprungen. */ }
    }
  }
}

function renderLibrary() {
  const root = document.querySelector('#map-library');
  const library = readMapLibrary().sort((a, b) => b.updatedAt - a.updatedAt);
  root.replaceChildren();
  if (!library.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-library';
    empty.innerHTML = '<strong>Keine Karten gefunden</strong><br>Speichere zuerst eine Karte in Prototyp 02.';
    root.append(empty);
    return;
  }
  for (const entry of library) {
    const card = document.createElement('article');
    card.className = 'library-map';
    const canvas = document.createElement('canvas');
    canvas.className = 'library-preview';
    const info = document.createElement('div');
    info.className = 'library-info';
    const tileCount = entry.state.layers.reduce((sum, layer) => sum + (layer.placements?.length || 0), 0);
    info.innerHTML = `<strong></strong><span>${entry.state.map.columns}×${entry.state.map.rows} · ${tileCount} Elemente</span>`;
    info.querySelector('strong').textContent = entry.name;
    const button = document.createElement('button');
    button.textContent = 'Zur Welt hinzufügen';
    button.addEventListener('click', () => addSection(entry));
    info.append(button);
    card.append(canvas, info);
    root.append(card);
    mapPreview(entry.state, canvas);
  }
}

function findOpenPosition(width, height) {
  if (!world.sections.length) return { x: snap(WORLD_WIDTH / 2 - width / 2), y: snap(WORLD_HEIGHT / 2 - height / 2) };
  const right = Math.max(...world.sections.map(section => section.x + mapWidth(section)));
  const top = Math.min(...world.sections.map(section => section.y));
  if (right + width + 160 < WORLD_WIDTH) return { x: snap(right + 128), y: snap(top) };
  return { x: snap(WORLD_WIDTH / 2 - width / 2), y: snap(top + height + 128) };
}

function addSection(entry) {
  pushHistory();
  const position = findOpenPosition(entry.state.map.columns * TILE_SIZE, entry.state.map.rows * TILE_SIZE);
  const section = { id: nextId('map'), sourceMapId: entry.id, name: entry.name, x: position.x, y: position.y, mapState: clone(entry.state) };
  world.sections.push(section);
  selected = { type: 'section', id: section.id };
  renderWorld();
  markDirty();
  focusSection(section);
  toast(`„${entry.name}“ hinzugefügt`);
}

function createSectionElement(section) {
  const element = document.createElement('article');
  element.className = `section${selected?.type === 'section' && selected.id === section.id ? ' selected' : ''}`;
  element.dataset.id = section.id;
  Object.assign(element.style, { left: `${section.x}px`, top: `${section.y}px`, width: `${mapWidth(section)}px`, height: `${mapHeight(section)}px` });
  const canvas = document.createElement('canvas');
  const label = document.createElement('span');
  label.className = 'section-label';
  label.textContent = section.name;
  element.append(canvas, label);
  mapPreview(section.mapState, canvas);
  for (const portal of world.portals.filter(entry => entry.sectionId === section.id)) element.append(createPortalElement(portal));
  if (world.spawn?.sectionId === section.id) element.append(createSpawnElement(world.spawn));
  element.addEventListener('pointerdown', event => sectionPointerDown(event, section, element));
  return element;
}

function createPortalElement(portal) {
  const element = document.createElement('button');
  element.className = `portal${selected?.type === 'portal' && selected.id === portal.id ? ' selected' : ''}`;
  Object.assign(element.style, { left: `${portal.x}px`, top: `${portal.y}px` });
  element.title = portal.name;
  const label = document.createElement('span');
  label.className = 'portal-name';
  label.textContent = portal.name;
  element.append(label);
  element.addEventListener('pointerdown', event => {
    event.stopPropagation();
    selected = { type: 'portal', id: portal.id };
    renderInspector();
    worldElement.querySelectorAll('.portal.selected,.spawn.selected').forEach(entry => entry.classList.remove('selected'));
    element.classList.add('selected');
    if (tool === 'select') {
      itemDrag = { type: 'portal', id: portal.id, startX: event.clientX, startY: event.clientY, x: portal.x, y: portal.y, before: stateString() };
      element.setPointerCapture?.(event.pointerId);
    }
  });
  return element;
}

function createSpawnElement(spawn) {
  const element = document.createElement('button');
  element.className = `spawn${selected?.type === 'spawn' ? ' selected' : ''}`;
  Object.assign(element.style, { left: `${spawn.x}px`, top: `${spawn.y}px` });
  element.title = 'Spawn für neue Charaktere';
  const label = document.createElement('span');
  label.className = 'spawn-name';
  label.textContent = 'Charakter-Spawn';
  element.append(label);
  element.addEventListener('pointerdown', event => {
    event.stopPropagation();
    selected = { type: 'spawn' };
    renderInspector();
    worldElement.querySelectorAll('.portal.selected,.spawn.selected').forEach(entry => entry.classList.remove('selected'));
    element.classList.add('selected');
    if (tool === 'select') {
      itemDrag = { type: 'spawn', startX: event.clientX, startY: event.clientY, x: spawn.x, y: spawn.y, before: stateString() };
      element.setPointerCapture?.(event.pointerId);
    }
  });
  return element;
}

function sectionPointerDown(event, section, element) {
  event.stopPropagation();
  if (tool === 'pan') {
    pan = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    viewport.style.cursor = 'grabbing';
    element.setPointerCapture?.(event.pointerId);
    return;
  }
  if (tool === 'portal') {
    const bounds = element.getBoundingClientRect();
    buildPortal(section, place((event.clientX - bounds.left) / bounds.width * mapWidth(section)), place((event.clientY - bounds.top) / bounds.height * mapHeight(section)));
    return;
  }
  if (tool === 'spawn') {
    const bounds = element.getBoundingClientRect();
    setSpawn(section, place((event.clientX - bounds.left) / bounds.width * mapWidth(section)), place((event.clientY - bounds.top) / bounds.height * mapHeight(section)));
    return;
  }
  if (tool !== 'select') return;
  selected = { type: 'section', id: section.id };
  renderInspector();
  worldElement.querySelectorAll('.section.selected').forEach(entry => entry.classList.remove('selected'));
  element.classList.add('selected', 'dragging');
  drag = { id: section.id, startX: event.clientX, startY: event.clientY, x: section.x, y: section.y, before: stateString() };
  element.setPointerCapture?.(event.pointerId);
}

function buildPortal(section, x, y) {
  pushHistory();
  const target = world.sections.find(entry => entry.id !== section.id) || section;
  const portal = { id: nextId('portal'), name: `Portal ${world.portals.length + 1}`, sectionId: section.id, x: clamp(integer(x), 0, mapWidth(section)), y: clamp(integer(y), 0, mapHeight(section)), targetSectionId: target.id, targetX: integer(mapWidth(target) / 2), targetY: integer(mapHeight(target) / 2) };
  world.portals.push(portal);
  selected = { type: 'portal', id: portal.id };
  setTool('select');
  renderWorld();
  markDirty();
  toast('Portal gebaut – Ziel rechts einstellen');
}

function setSpawn(section, x, y) {
  pushHistory();
  world.spawn = { sectionId: section.id, x: clamp(integer(x), 0, mapWidth(section)), y: clamp(integer(y), 0, mapHeight(section)) };
  selected = { type: 'spawn' };
  setTool('select');
  renderWorld();
  markDirty();
  toast('Spawn für neue Charaktere gesetzt');
}

function renderWorld() {
  worldElement.querySelectorAll('.section').forEach(element => element.remove());
  for (const section of world.sections) worldElement.append(createSectionElement(section));
  document.querySelector('#empty-world').hidden = world.sections.length > 0;
  document.querySelector('#status-count').textContent = `${world.sections.length} Abschnitt${world.sections.length === 1 ? '' : 'e'} · ${world.portals.length} Portal${world.portals.length === 1 ? '' : 'e'} · Spawn ${world.spawn ? 'gesetzt' : 'fehlt'}`;
  renderLinks();
  renderInspector();
}

function renderLinks() {
  linksElement.replaceChildren();
  const namespace = 'http://www.w3.org/2000/svg';
  const definitions = document.createElementNS(namespace, 'defs');
  definitions.innerHTML = '<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#5bdac4"/></marker>';
  linksElement.append(definitions);
  if (!document.querySelector('#show-links').checked) return;
  for (const portal of world.portals) {
    const source = sectionById(portal.sectionId);
    const target = sectionById(portal.targetSectionId);
    if (!source || !target) continue;
    const startX = source.x + portal.x, startY = source.y + portal.y, endX = target.x + portal.targetX, endY = target.y + portal.targetY;
    const bend = Math.max(120, Math.abs(endX - startX) * .35);
    const path = document.createElementNS(namespace, 'path');
    path.classList.add('portal-link');
    path.setAttribute('d', `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`);
    linksElement.append(path);
  }
}

function renderInspector() {
  const section = selected?.type === 'section' ? sectionById(selected.id) : null;
  const portal = selected?.type === 'portal' ? portalById(selected.id) : null;
  const spawn = selected?.type === 'spawn' ? world.spawn : null;
  document.querySelector('#nothing-selected').hidden = Boolean(section || portal || spawn);
  document.querySelector('#section-inspector').hidden = !section;
  document.querySelector('#portal-inspector').hidden = !portal;
  document.querySelector('#spawn-inspector').hidden = !spawn;
  if (section) {
    document.querySelector('#section-name').value = section.name;
    document.querySelector('#section-x').value = section.x;
    document.querySelector('#section-y').value = section.y;
    const portals = world.portals.filter(entry => entry.sectionId === section.id).length;
    document.querySelector('#section-meta').textContent = `${section.mapState.map.columns} × ${section.mapState.map.rows} Tiles · ${mapWidth(section)} × ${mapHeight(section)} px · ${portals} Portale`;
    document.querySelector('#update-section').disabled = !readMapLibrary().some(entry => entry.id === section.sourceMapId);
  }
  if (portal) {
    const source = sectionById(portal.sectionId);
    document.querySelector('#portal-name').value = portal.name;
    document.querySelector('#portal-x').max = mapWidth(source);
    document.querySelector('#portal-y').max = mapHeight(source);
    document.querySelector('#portal-x').value = portal.x;
    document.querySelector('#portal-y').value = portal.y;
    const targetSelect = document.querySelector('#portal-target');
    targetSelect.replaceChildren();
    for (const entry of world.sections) targetSelect.add(new Option(entry.name, entry.id));
    targetSelect.value = portal.targetSectionId;
    document.querySelector('#target-x').value = portal.targetX;
    document.querySelector('#target-y').value = portal.targetY;
  }
  if (spawn) {
    const sectionSelect = document.querySelector('#spawn-section');
    sectionSelect.replaceChildren();
    for (const entry of world.sections) sectionSelect.add(new Option(entry.name, entry.id));
    sectionSelect.value = spawn.sectionId;
    document.querySelector('#spawn-x').value = spawn.x;
    document.querySelector('#spawn-y').value = spawn.y;
  }
}

function setTool(next) {
  tool = next;
  document.querySelectorAll('.tool').forEach(button => button.classList.toggle('active', button.dataset.tool === tool));
  document.querySelector('#status-tool').textContent = { select: 'Auswählen', portal: 'Portal bauen', spawn: 'Spawn setzen', pan: 'Hand' }[tool];
  viewport.style.cursor = tool === 'pan' ? 'grab' : 'default';
}

function applyZoom() { zoom = Number(document.querySelector('#zoom').value); worldElement.style.zoom = zoom; }
function focusSection(section) { viewport.scrollTo({ left: (section.x + mapWidth(section) / 2) * zoom - viewport.clientWidth / 2, top: (section.y + mapHeight(section) / 2) * zoom - viewport.clientHeight / 2, behavior: 'smooth' }); }
function centerWorld() {
  if (!world.sections.length) return viewport.scrollTo({ left: WORLD_WIDTH * zoom / 2 - viewport.clientWidth / 2, top: WORLD_HEIGHT * zoom / 2 - viewport.clientHeight / 2, behavior: 'smooth' });
  const left = Math.min(...world.sections.map(section => section.x)), right = Math.max(...world.sections.map(section => section.x + mapWidth(section)));
  const top = Math.min(...world.sections.map(section => section.y)), bottom = Math.max(...world.sections.map(section => section.y + mapHeight(section)));
  viewport.scrollTo({ left: ((left + right) / 2) * zoom - viewport.clientWidth / 2, top: ((top + bottom) / 2) * zoom - viewport.clientHeight / 2, behavior: 'smooth' });
}

function markDirty() { document.querySelector('#save-state').textContent = 'Nicht gespeichert'; }
function toast(message) { const element = document.querySelector('#toast'); element.textContent = message; element.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('show'), 1900); }
function serializableWorld() { return clone({ ...world, name: document.querySelector('#world-name').value.trim() || 'Meine Welt' }); }
function playCurrentWorld() { localStorage.setItem(PLAYTEST_KEY, JSON.stringify({ source: '03', label: document.querySelector('#world-name').value.trim() || 'Aktuelle Welt', returnUrl: '../03-world-builder/', world: serializableWorld() })); location.href = '../01-side-view-movement/'; }
function stateString() { return JSON.stringify(serializableWorld()); }
function rememberSnapshot(snapshot) {
  if (history.at(-1) === snapshot) return;
  history.push(snapshot);
  if (history.length > MAX_HISTORY) history.shift();
  updateUndoButton();
}
function pushHistory() { rememberSnapshot(stateString()); }
function updateUndoButton() { document.querySelector('#undo').disabled = history.length === 0; }
function undo() {
  const current = stateString();
  let snapshot;
  while (history.length && (!snapshot || snapshot === current)) snapshot = history.pop();
  if (!snapshot || snapshot === current) { updateUndoButton(); return; }
  restoreWorld(JSON.parse(snapshot));
  markDirty();
  updateUndoButton();
  toast('Änderung rückgängig gemacht');
}
function saveWorld() { world.name = document.querySelector('#world-name').value.trim() || 'Meine Welt'; localStorage.setItem(WORLD_STORAGE_KEY, JSON.stringify({ updatedAt: Date.now(), world: serializableWorld() })); document.querySelector('#save-state').textContent = `Gespeichert: ${world.name}`; toast('Welt lokal gespeichert'); }

function restoreWorld(value) {
  if (!value || !Array.isArray(value.sections) || !Array.isArray(value.portals)) throw new Error('Ungültiges Weltformat');
  world = { version: 2, name: String(value.name || 'Meine Welt'), sections: clone(value.sections), portals: clone(value.portals), spawn: value.spawn ? clone(value.spawn) : null };
  selected = null;
  document.querySelector('#world-name').value = world.name;
  renderWorld();
  centerWorld();
}

function openLoadDialog() {
  const root = document.querySelector('#saved-world');
  root.replaceChildren();
  try {
    const saved = JSON.parse(localStorage.getItem(WORLD_STORAGE_KEY) || 'null');
    if (!saved?.world) throw new Error();
    const card = document.createElement('article');
    card.className = 'saved-world-card';
    const info = document.createElement('div');
    info.innerHTML = `<strong></strong><br><span>${saved.world.sections.length} Abschnitte · ${saved.world.portals.length} Portale · Spawn ${saved.world.spawn ? 'gesetzt' : 'fehlt'} · ${new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(saved.updatedAt)}</span>`;
    info.querySelector('strong').textContent = saved.world.name;
    const button = document.createElement('button'); button.textContent = 'Welt laden';
    button.addEventListener('click', () => { pushHistory(); restoreWorld(saved.world); document.querySelector('#load-dialog').close(); toast('Welt geladen'); });
    card.append(info, button); root.append(card);
  } catch { root.innerHTML = '<div class="empty-library">Noch keine Welt gespeichert.</div>'; }
  document.querySelector('#load-dialog').showModal();
}

function exportWorld() {
  const blob = new Blob([JSON.stringify(serializableWorld(), null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${(world.name || 'idlekin-welt').replace(/[^a-z0-9äöüß-]+/gi, '-').toLowerCase()}.json`;
  link.click(); URL.revokeObjectURL(link.href); toast('Welt als JSON exportiert');
}

function bindInspector() {
  document.querySelector('#section-name').addEventListener('change', event => { const section = sectionById(selected?.id); if (!section || section.name === event.target.value) return; pushHistory(); section.name = event.target.value; renderWorld(); markDirty(); });
  for (const [selector, property] of [['#section-x', 'x'], ['#section-y', 'y']]) document.querySelector(selector).addEventListener('change', event => { const section = sectionById(selected?.id); if (!section) return; const value = clamp(integer(event.target.value), 0, property === 'x' ? WORLD_WIDTH - mapWidth(section) : WORLD_HEIGHT - mapHeight(section)); if (value === section[property]) return; pushHistory(); section[property] = value; renderWorld(); markDirty(); });
  document.querySelector('#remove-section').addEventListener('click', () => {
    const section = sectionById(selected?.id); if (!section || !confirm(`„${section.name}“ und seine Portalverbindungen entfernen?`)) return;
    pushHistory();
    world.sections = world.sections.filter(entry => entry.id !== section.id);
    world.portals = world.portals.filter(portal => portal.sectionId !== section.id && portal.targetSectionId !== section.id);
    if (world.spawn?.sectionId === section.id) world.spawn = null;
    selected = null; renderWorld(); markDirty(); toast('Abschnitt entfernt');
  });
  document.querySelector('#update-section').addEventListener('click', () => {
    const section = sectionById(selected?.id); if (!section) return;
    const source = readMapLibrary().find(entry => entry.id === section.sourceMapId); if (!source) return;
    pushHistory();
    section.mapState = clone(source.state);
    for (const portal of world.portals.filter(entry => entry.sectionId === section.id)) { portal.x = clamp(portal.x, 0, mapWidth(section)); portal.y = clamp(portal.y, 0, mapHeight(section)); }
    if (world.spawn?.sectionId === section.id) { world.spawn.x = clamp(world.spawn.x, 0, mapWidth(section)); world.spawn.y = clamp(world.spawn.y, 0, mapHeight(section)); }
    renderWorld(); markDirty(); toast('Kartenabschnitt aktualisiert');
  });
  document.querySelector('#portal-name').addEventListener('change', event => { const portal = portalById(selected?.id); if (!portal || portal.name === event.target.value) return; pushHistory(); portal.name = event.target.value; renderWorld(); markDirty(); });
  for (const [selector, property] of [['#portal-x', 'x'], ['#portal-y', 'y'], ['#target-x', 'targetX'], ['#target-y', 'targetY']]) document.querySelector(selector).addEventListener('change', event => {
    const portal = portalById(selected?.id); if (!portal) return;
    const boundsSection = property.startsWith('target') ? sectionById(portal.targetSectionId) : sectionById(portal.sectionId);
    const maximum = property.toLowerCase().endsWith('x') ? mapWidth(boundsSection) : mapHeight(boundsSection);
    const value = clamp(integer(event.target.value), 0, maximum); if (value === portal[property]) return;
    pushHistory(); portal[property] = value; renderWorld(); markDirty();
  });
  document.querySelector('#portal-target').addEventListener('change', event => {
    const portal = portalById(selected?.id), target = sectionById(event.target.value); if (!portal || !target) return;
    if (portal.targetSectionId === target.id) return;
    pushHistory(); portal.targetSectionId = target.id; portal.targetX = integer(mapWidth(target) / 2); portal.targetY = integer(mapHeight(target) / 2); renderWorld(); markDirty();
  });
  document.querySelector('#jump-target').addEventListener('click', () => { const portal = portalById(selected?.id), target = portal && sectionById(portal.targetSectionId); if (target) focusSection(target); });
  document.querySelector('#remove-portal').addEventListener('click', () => { const portal = portalById(selected?.id); if (!portal) return; pushHistory(); world.portals = world.portals.filter(entry => entry.id !== portal.id); selected = null; renderWorld(); markDirty(); toast('Portal entfernt'); });
  for (const [selector, property] of [['#spawn-x', 'x'], ['#spawn-y', 'y']]) document.querySelector(selector).addEventListener('change', event => {
    if (!world.spawn) return;
    const section = sectionById(world.spawn.sectionId), maximum = property === 'x' ? mapWidth(section) : mapHeight(section);
    const value = clamp(integer(event.target.value), 0, maximum); if (value === world.spawn[property]) return;
    pushHistory(); world.spawn[property] = value; renderWorld(); markDirty();
  });
  document.querySelector('#spawn-section').addEventListener('change', event => {
    if (!world.spawn) return; const section = sectionById(event.target.value); if (!section || section.id === world.spawn.sectionId) return;
    pushHistory(); world.spawn.sectionId = section.id; world.spawn.x = integer(mapWidth(section) / 2); world.spawn.y = integer(mapHeight(section) / 2); renderWorld(); markDirty();
  });
  document.querySelector('#jump-spawn').addEventListener('click', () => { const section = world.spawn && sectionById(world.spawn.sectionId); if (section) focusSection(section); });
  document.querySelector('#remove-spawn').addEventListener('click', () => { if (!world.spawn) return; pushHistory(); world.spawn = null; selected = null; renderWorld(); markDirty(); toast('Charakter-Spawn entfernt'); });
}

function bindEvents() {
  document.querySelectorAll('.tool').forEach(button => button.addEventListener('click', () => setTool(button.dataset.tool)));
  document.querySelector('#zoom').addEventListener('change', () => { applyZoom(); centerWorld(); });
  document.querySelector('#show-links').addEventListener('change', renderLinks);
  document.querySelector('#snap-grid').addEventListener('change', event => { document.querySelector('#snap-size').disabled = !event.target.checked; });
  document.querySelector('#center-world').addEventListener('click', centerWorld);
  document.querySelector('#refresh-library').addEventListener('click', () => { renderLibrary(); toast('Kartenbibliothek aktualisiert'); });
  document.querySelector('#undo').addEventListener('click', undo);
  document.querySelector('#play-world').addEventListener('click', playCurrentWorld);
  document.querySelector('#save-world').addEventListener('click', saveWorld);
  document.querySelector('#load-world').addEventListener('click', openLoadDialog);
  document.querySelector('#close-dialog').addEventListener('click', () => document.querySelector('#load-dialog').close());
  document.querySelector('#export-world').addEventListener('click', exportWorld);
  document.querySelector('#import-world').addEventListener('click', () => document.querySelector('#import-file').click());
  document.querySelector('#import-file').addEventListener('change', async event => { const [file] = event.target.files; if (!file) return; try { const imported = JSON.parse(await file.text()); pushHistory(); restoreWorld(imported); markDirty(); toast('Welt importiert'); } catch (error) { toast(error.message); } event.target.value = ''; });
  document.querySelector('#world-name').addEventListener('input', markDirty);
  document.querySelector('#world-name').addEventListener('focus', pushHistory);
  worldElement.addEventListener('pointerdown', event => {
    if (event.target.closest('.section')) return;
    if (tool === 'select') { selected = null; renderWorld(); return; }
    if (tool !== 'pan') return;
    pan = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    viewport.style.cursor = 'grabbing'; worldElement.setPointerCapture?.(event.pointerId);
  });
  worldElement.addEventListener('pointermove', event => {
    if (drag) {
      const section = sectionById(drag.id); if (!section) return;
      section.x = clamp(place(drag.x + (event.clientX - drag.startX) / zoom), 0, WORLD_WIDTH - mapWidth(section));
      section.y = clamp(place(drag.y + (event.clientY - drag.startY) / zoom), 0, WORLD_HEIGHT - mapHeight(section));
      const element = worldElement.querySelector(`.section[data-id="${CSS.escape(section.id)}"]`);
      if (element) Object.assign(element.style, { left: `${section.x}px`, top: `${section.y}px` });
      renderLinks();
    }
    if (itemDrag) {
      const item = itemDrag.type === 'portal' ? portalById(itemDrag.id) : world.spawn;
      if (item) {
        const section = sectionById(item.sectionId);
        item.x = clamp(place(itemDrag.x + (event.clientX - itemDrag.startX) / zoom), 0, mapWidth(section));
        item.y = clamp(place(itemDrag.y + (event.clientY - itemDrag.startY) / zoom), 0, mapHeight(section));
        const element = worldElement.querySelector(itemDrag.type === 'portal' ? `.portal.selected` : '.spawn.selected');
        if (element) Object.assign(element.style, { left: `${item.x}px`, top: `${item.y}px` });
        renderLinks();
      }
    }
    if (pan) { viewport.scrollLeft = pan.left - (event.clientX - pan.x); viewport.scrollTop = pan.top - (event.clientY - pan.y); }
  });
  worldElement.addEventListener('pointerup', () => { if (drag) { if (sectionById(drag.id)?.x !== drag.x || sectionById(drag.id)?.y !== drag.y) rememberSnapshot(drag.before); drag = null; renderInspector(); markDirty(); } if (itemDrag) { const item = itemDrag.type === 'portal' ? portalById(itemDrag.id) : world.spawn; if (item && (item.x !== itemDrag.x || item.y !== itemDrag.y)) rememberSnapshot(itemDrag.before); itemDrag = null; renderInspector(); markDirty(); } if (pan) { pan = null; viewport.style.cursor = 'grab'; } });
  window.addEventListener('keydown', event => {
    if (event.ctrlKey && event.key.toLowerCase() === 'z') { event.preventDefault(); undo(); return; }
    if (event.target.matches('input,select')) return;
    if (event.code === 'Space' && !previousTool) { event.preventDefault(); previousTool = tool; setTool('pan'); return; }
    const shortcut = !event.ctrlKey && { v: 'select', p: 'portal', s: 'spawn', h: 'pan' }[event.key.toLowerCase()]; if (shortcut) setTool(shortcut);
    if (event.key === 'Delete' && selected?.type === 'portal') document.querySelector('#remove-portal').click();
  });
  window.addEventListener('keyup', event => { if (event.code === 'Space' && previousTool) { setTool(previousTool); previousTool = null; } });
  bindInspector();
}

function start() { renderLibrary(); bindEvents(); applyZoom(); renderWorld(); requestAnimationFrame(centerWorld); }
start();
