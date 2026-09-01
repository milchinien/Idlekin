const TILE_SIZE = 32;
const LEGACY_STORAGE_KEY = 'idlekin.prototype02.tilemap.v1';
const LIBRARY_STORAGE_KEY = 'idlekin.prototype02.maps.v1';
const MAX_HISTORY = 60;
const PLAYTEST_KEY = 'idlekin.playtest.payload.v1';

const TILESET_SHEETS = [
  ['Tileset', 'Tileset.png'],
  ['Objekte', 'Objects.png'],
  ['Details', 'Details.png'],
  ['Höhleneingang', 'cave_entrance.png'],
  ['Truhe', 'chest.png'],
  ['Wolken-Tiles', 'Clouds_in_tiles.png'],
  ['Feen', 'Fairys.png'],
  ['Fliegende Steine', 'Flying_stone.png'],
  ['Schlüssel', 'key.png'],
  ['Raubpflanze', 'Predator_plant.png'],
  ['Glitzern', 'shinies.png'],
  ['Stacheln', 'Spikes.png'],
  ['Stalaktiten', 'stalactites.png'],
].map(([label, file]) => ({ label, file, gridSize: TILE_SIZE, group: 'Tileset', src: `../../assets/tileset/PNG/${file}` }));

const PROP_SHEETS = [
  ['Dorf-Props', 'TX Village Props.png', 32],
  ['Props-Boden', 'TX Tileset Ground.png', 32],
  ['Truhen-Animation', 'TX Chest Animation.png', 64],
  ['Flammen-Animation', 'TX FX Flame.png', 40],
  ['Fackelflammen', 'TX FX Torch Flame.png', 32],
].map(([label, file, gridSize]) => ({
  label,
  file: `props/${file}`,
  gridSize,
  group: 'Props & Dekoration',
  src: `../../assets/props/Textures/${file}`,
}));

const SHEETS = [...TILESET_SHEETS, ...PROP_SHEETS];

const BACKGROUNDS = [
  ['Kompletter Wald', 'Full_bgx32.png'],
  ['Himmel', 'Skyx32.png'],
  ['Wolken', 'Clouds_x32.png'],
  ['Flora hinten', 'Flora2x32.png'],
  ['Flora vorne', 'Flora1x32.png'],
].map(([label, file]) => ({ label, file, src: `../../assets/tileset/PNG/Background/x32/${file}` }));

const LAYERS = [
  { id: 'background-tiles', label: 'Hintergrund-Tiles', visible: true, placements: [] },
  { id: 'terrain', label: 'Boden & Plattformen', visible: true, placements: [] },
  { id: 'decoration', label: 'Dekoration', visible: true, placements: [] },
  { id: 'foreground', label: 'Vordergrund', visible: true, placements: [] },
];

const TOOL_LABELS = {
  pencil: 'Malen', eraser: 'Löschen', rectangle: 'Fläche', picker: 'Picker', collision: 'Kollision', pan: 'Hand',
};

const mapCanvas = document.querySelector('#map');
const mapContext = mapCanvas.getContext('2d');
const paletteCanvas = document.querySelector('#palette');
const paletteContext = paletteCanvas.getContext('2d');
const previewCanvas = document.querySelector('#selection-preview');
const previewContext = previewCanvas.getContext('2d');
const stage = document.querySelector('#stage');

mapContext.imageSmoothingEnabled = false;
paletteContext.imageSmoothingEnabled = false;
previewContext.imageSmoothingEnabled = false;

const sheetImages = new Map();
const backgroundImages = new Map();
let map = { columns: 30, rows: 17, background: BACKGROUNDS[0].file };
let layers = structuredClone(LAYERS);
let activeLayerId = 'terrain';
let activeSheet = SHEETS[0].file;
let selection = { x: 0, y: 0, width: 1, height: 1 };
let paletteDragStart = null;
let tool = 'pencil';
let previousTool = null;
let pointerDown = false;
let lastPaintCell = null;
let rectangleStart = null;
let rectangleEnd = null;
let panStart = null;
let placementSequence = 1;
let collision = new Set();
let history = [];
let future = [];
let toastTimer = 0;
let currentMapId = null;

function imageFrom(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Bild konnte nicht geladen werden: ${src}`));
    image.src = src;
  });
}

function activeLayer() {
  return layers.find(layer => layer.id === activeLayerId);
}

function activeSheetDefinition() {
  return SHEETS.find(sheet => sheet.file === activeSheet) || SHEETS[0];
}

function activeGridSize() {
  return activeSheetDefinition().gridSize;
}

function selectionPixelSize() {
  const gridSize = activeGridSize();
  return { width: selection.width * gridSize, height: selection.height * gridSize };
}

function selectionMapSpan() {
  const pixels = selectionPixelSize();
  return { width: Math.ceil(pixels.width / TILE_SIZE), height: Math.ceil(pixels.height / TILE_SIZE) };
}

function mapWidth() { return map.columns * TILE_SIZE; }
function mapHeight() { return map.rows * TILE_SIZE; }
function collisionKey(x, y) { return `${x},${y}`; }

function serializableState() {
  return {
    version: 2,
    tileSize: TILE_SIZE,
    map: structuredClone(map),
    layers: structuredClone(layers),
    collision: [...collision],
    placementSequence,
  };
}

function playCurrentMap() {
  localStorage.setItem(PLAYTEST_KEY, JSON.stringify({ source: '02', label: 'Aktuelle Karte aus Prototyp 02', returnUrl: '../02-tilemap-editor/', map: serializableState() }));
  location.href = '../01-side-view-movement/';
}

function stateString() { return JSON.stringify(serializableState()); }

function restoreState(value) {
  if (!value?.map || !Array.isArray(value.layers)) throw new Error('Ungültiges Map-Format');
  map = {
    columns: Math.max(8, Math.min(200, Number(value.map.columns) || 30)),
    rows: Math.max(6, Math.min(120, Number(value.map.rows) || 17)),
    background: value.map.background || '',
  };
  layers = LAYERS.map(base => {
    const saved = value.layers.find(layer => layer.id === base.id);
    return saved ? { ...base, ...saved, placements: Array.isArray(saved.placements) ? saved.placements : [] } : structuredClone(base);
  });
  collision = new Set(Array.isArray(value.collision) ? value.collision : []);
  placementSequence = Math.max(1, Number(value.placementSequence) || 1);
  syncMapControls();
  renderLayers();
  resizeCanvas();
  markDirty();
}

function pushHistory() {
  history.push(stateString());
  if (history.length > MAX_HISTORY) history.shift();
  future = [];
  updateHistoryButtons();
}

function undo() {
  if (!history.length) return;
  future.push(stateString());
  restoreState(JSON.parse(history.pop()));
  updateHistoryButtons();
}

function redo() {
  if (!future.length) return;
  history.push(stateString());
  restoreState(JSON.parse(future.pop()));
  updateHistoryButtons();
}

function updateHistoryButtons() {
  document.querySelector('#undo').disabled = history.length === 0;
  document.querySelector('#redo').disabled = future.length === 0;
}

function resizeCanvas() {
  mapCanvas.width = mapWidth();
  mapCanvas.height = mapHeight();
  mapContext.imageSmoothingEnabled = false;
  applyZoom();
  drawMap();
  document.querySelector('#map-size-label').textContent = `${map.columns} × ${map.rows} Tiles · ${mapWidth()} × ${mapHeight()} px`;
}

function applyZoom() {
  const zoom = Number(document.querySelector('#zoom').value);
  mapCanvas.style.width = `${mapWidth() * zoom}px`;
  mapCanvas.style.height = `${mapHeight() * zoom}px`;
}

function drawMap() {
  mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
  drawStateContent(mapContext, { map, layers }, 0, 0, mapWidth(), mapHeight());

  if (document.querySelector('#show-collision').checked) {
    mapContext.fillStyle = 'rgba(236, 80, 93, .28)';
    mapContext.strokeStyle = 'rgba(255, 120, 127, .8)';
    for (const entry of collision) {
      const [x, y] = entry.split(',').map(Number);
      mapContext.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      mapContext.strokeRect(x * TILE_SIZE + .5, y * TILE_SIZE + .5, TILE_SIZE - 1, TILE_SIZE - 1);
    }
  }

  if (document.querySelector('#show-grid').checked) drawGrid();
  drawRectanglePreview();
}

function drawStateContent(context, state, targetX, targetY, targetWidth, targetHeight) {
  const sourceWidth = state.map.columns * TILE_SIZE;
  const sourceHeight = state.map.rows * TILE_SIZE;
  context.save();
  context.translate(targetX, targetY);
  context.scale(targetWidth / sourceWidth, targetHeight / sourceHeight);
  context.imageSmoothingEnabled = false;
  const background = backgroundImages.get(state.map.background);
  if (background) context.drawImage(background, 0, 0, sourceWidth, sourceHeight);
  else {
    context.fillStyle = '#141922';
    context.fillRect(0, 0, sourceWidth, sourceHeight);
  }

  for (const layer of state.layers) {
    if (!layer.visible) continue;
    for (const placement of layer.placements) {
      const image = sheetImages.get(placement.sheet);
      if (!image) continue;
      const sourceGridSize = placement.sourceGridSize || TILE_SIZE;
      const sourceColumns = placement.sourceColumns || placement.width;
      const sourceRows = placement.sourceRows || placement.height;
      const pixelWidth = placement.pixelWidth || sourceColumns * sourceGridSize;
      const pixelHeight = placement.pixelHeight || sourceRows * sourceGridSize;
      context.drawImage(
        image,
        placement.sourceX * sourceGridSize,
        placement.sourceY * sourceGridSize,
        sourceColumns * sourceGridSize,
        sourceRows * sourceGridSize,
        placement.x * TILE_SIZE,
        placement.y * TILE_SIZE,
        pixelWidth,
        pixelHeight,
      );
    }
  }
  context.restore();
}

function captureThumbnail(state = serializableState()) {
  const width = 400;
  const height = 225;
  const sourceWidth = state.map.columns * TILE_SIZE;
  const sourceHeight = state.map.rows * TILE_SIZE;
  const scale = Math.min(width / sourceWidth, height / sourceHeight);
  const drawWidth = Math.max(1, Math.round(sourceWidth * scale));
  const drawHeight = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false;
  context.fillStyle = '#0d1015';
  context.fillRect(0, 0, width, height);
  drawStateContent(context, state, Math.floor((width - drawWidth) / 2), Math.floor((height - drawHeight) / 2), drawWidth, drawHeight);
  return canvas.toDataURL('image/png');
}

function drawGrid() {
  mapContext.beginPath();
  mapContext.strokeStyle = 'rgba(225, 235, 245, .13)';
  mapContext.lineWidth = 1;
  for (let x = 0; x <= map.columns; x += 1) {
    mapContext.moveTo(x * TILE_SIZE + .5, 0);
    mapContext.lineTo(x * TILE_SIZE + .5, mapHeight());
  }
  for (let y = 0; y <= map.rows; y += 1) {
    mapContext.moveTo(0, y * TILE_SIZE + .5);
    mapContext.lineTo(mapWidth(), y * TILE_SIZE + .5);
  }
  mapContext.stroke();
}

function drawRectanglePreview() {
  if (!rectangleStart || !rectangleEnd || tool !== 'rectangle') return;
  const left = Math.min(rectangleStart.x, rectangleEnd.x);
  const top = Math.min(rectangleStart.y, rectangleEnd.y);
  const right = Math.max(rectangleStart.x, rectangleEnd.x);
  const bottom = Math.max(rectangleStart.y, rectangleEnd.y);
  mapContext.fillStyle = 'rgba(143, 207, 114, .2)';
  mapContext.strokeStyle = '#b9ee9f';
  mapContext.fillRect(left * TILE_SIZE, top * TILE_SIZE, (right - left + 1) * TILE_SIZE, (bottom - top + 1) * TILE_SIZE);
  mapContext.strokeRect(left * TILE_SIZE + .5, top * TILE_SIZE + .5, (right - left + 1) * TILE_SIZE - 1, (bottom - top + 1) * TILE_SIZE - 1);
}

function renderPalette() {
  const image = sheetImages.get(activeSheet);
  if (!image) return;
  paletteCanvas.width = image.naturalWidth;
  paletteCanvas.height = image.naturalHeight;
  paletteContext.imageSmoothingEnabled = false;
  paletteContext.clearRect(0, 0, paletteCanvas.width, paletteCanvas.height);
  paletteContext.drawImage(image, 0, 0);
  const gridSize = activeGridSize();
  paletteContext.beginPath();
  paletteContext.strokeStyle = 'rgba(230, 240, 250, .18)';
  for (let x = 0; x <= image.naturalWidth; x += gridSize) {
    paletteContext.moveTo(x + .5, 0); paletteContext.lineTo(x + .5, image.naturalHeight);
  }
  for (let y = 0; y <= image.naturalHeight; y += gridSize) {
    paletteContext.moveTo(0, y + .5); paletteContext.lineTo(image.naturalWidth, y + .5);
  }
  paletteContext.stroke();
  paletteContext.fillStyle = 'rgba(255, 220, 84, .14)';
  paletteContext.strokeStyle = '#ffdf62';
  paletteContext.lineWidth = 2;
  paletteContext.fillRect(selection.x * gridSize, selection.y * gridSize, selection.width * gridSize, selection.height * gridSize);
  paletteContext.strokeRect(selection.x * gridSize + 1, selection.y * gridSize + 1, selection.width * gridSize - 2, selection.height * gridSize - 2);
  renderSelectionPreview();
}

function renderSelectionPreview() {
  const image = sheetImages.get(activeSheet);
  if (!image) return;
  previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  const gridSize = activeGridSize();
  const sourceWidth = selection.width * gridSize;
  const sourceHeight = selection.height * gridSize;
  const scale = Math.min(previewCanvas.width / sourceWidth, previewCanvas.height / sourceHeight, 2);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  previewContext.drawImage(
    image,
    selection.x * gridSize, selection.y * gridSize, sourceWidth, sourceHeight,
    Math.floor((previewCanvas.width - width) / 2), Math.floor((previewCanvas.height - height) / 2), width, height,
  );
  const sheet = SHEETS.find(entry => entry.file === activeSheet);
  document.querySelector('#selection-name').textContent = sheet?.label || activeSheet;
  document.querySelector('#selection-coords').textContent = `Spalte ${selection.x} · Zeile ${selection.y}`;
  const span = selectionMapSpan();
  document.querySelector('#selection-size').textContent = `${sourceWidth}×${sourceHeight} px · Raster ${gridSize}px`;
  document.querySelector('#status-selection').textContent = `${span.width}×${span.height} Map-Tile${span.width * span.height === 1 ? '' : 's'}`;
}

function renderLayers() {
  const root = document.querySelector('#layers');
  root.replaceChildren();
  for (const layer of [...layers].reverse()) {
    const row = document.createElement('div');
    row.className = `layer${layer.id === activeLayerId ? ' active' : ''}`;
    row.dataset.layer = layer.id;
    const visibility = document.createElement('input');
    visibility.type = 'checkbox';
    visibility.checked = layer.visible;
    visibility.title = 'Ebene anzeigen';
    visibility.addEventListener('click', event => event.stopPropagation());
    visibility.addEventListener('change', () => { layer.visible = visibility.checked; drawMap(); markDirty(); });
    const label = document.createElement('span');
    label.textContent = layer.label;
    const count = document.createElement('small');
    count.textContent = String(layer.placements.length);
    row.append(visibility, label, count);
    row.addEventListener('click', () => { activeLayerId = layer.id; renderLayers(); });
    root.append(row);
  }
}

function paletteCell(event) {
  const bounds = paletteCanvas.getBoundingClientRect();
  const gridSize = activeGridSize();
  const x = Math.floor((event.clientX - bounds.left) * paletteCanvas.width / bounds.width / gridSize);
  const y = Math.floor((event.clientY - bounds.top) * paletteCanvas.height / bounds.height / gridSize);
  return {
    x: Math.max(0, Math.min(Math.ceil(paletteCanvas.width / gridSize) - 1, x)),
    y: Math.max(0, Math.min(Math.ceil(paletteCanvas.height / gridSize) - 1, y)),
  };
}

function mapCell(event) {
  const bounds = mapCanvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(map.columns - 1, Math.floor((event.clientX - bounds.left) * mapCanvas.width / bounds.width / TILE_SIZE))),
    y: Math.max(0, Math.min(map.rows - 1, Math.floor((event.clientY - bounds.top) * mapCanvas.height / bounds.height / TILE_SIZE))),
  };
}

function overlapsCell(placement, cell) {
  return cell.x >= placement.x && cell.x < placement.x + placement.width && cell.y >= placement.y && cell.y < placement.y + placement.height;
}

function eraseAt(cell) {
  const layer = activeLayer();
  const previousLength = layer.placements.length;
  layer.placements = layer.placements.filter(placement => !overlapsCell(placement, cell));
  if (layer.placements.length !== previousLength) { renderLayers(); markDirty(); }
}

function placeAt(cell, refresh = true) {
  const layer = activeLayer();
  const sourceGridSize = activeGridSize();
  const pixelWidth = selection.width * sourceGridSize;
  const pixelHeight = selection.height * sourceGridSize;
  const placement = {
    id: placementSequence++, sheet: activeSheet,
    sourceX: selection.x, sourceY: selection.y,
    sourceGridSize,
    sourceColumns: selection.width, sourceRows: selection.height,
    pixelWidth, pixelHeight,
    width: Math.ceil(pixelWidth / TILE_SIZE), height: Math.ceil(pixelHeight / TILE_SIZE),
    x: cell.x, y: cell.y,
  };
  layer.placements = layer.placements.filter(existing => {
    const separated = placement.x + placement.width <= existing.x || existing.x + existing.width <= placement.x || placement.y + placement.height <= existing.y || existing.y + existing.height <= placement.y;
    return separated;
  });
  layer.placements.push(placement);
  if (refresh) {
    renderLayers();
    markDirty();
  }
}

function paintRectangle() {
  const left = Math.min(rectangleStart.x, rectangleEnd.x);
  const top = Math.min(rectangleStart.y, rectangleEnd.y);
  const right = Math.max(rectangleStart.x, rectangleEnd.x);
  const bottom = Math.max(rectangleStart.y, rectangleEnd.y);
  const span = selectionMapSpan();
  for (let y = top; y <= bottom; y += span.height) {
    for (let x = left; x <= right; x += span.width) placeAt({ x, y }, false);
  }
  renderLayers();
  markDirty();
}

function pickAt(cell) {
  for (const layer of [...layers].reverse()) {
    if (!layer.visible) continue;
    const placement = [...layer.placements].reverse().find(entry => overlapsCell(entry, cell));
    if (!placement) continue;
    activeLayerId = layer.id;
    activeSheet = placement.sheet;
    selection = {
      x: placement.sourceX,
      y: placement.sourceY,
      width: placement.sourceColumns || placement.width,
      height: placement.sourceRows || placement.height,
    };
    document.querySelector('#sheet').value = activeSheet;
    renderLayers();
    renderPalette();
    setTool('pencil');
    toast('Tile aufgenommen');
    return;
  }
}

function toggleCollision(cell, force) {
  const key = collisionKey(cell.x, cell.y);
  if (force === true || (force === undefined && !collision.has(key))) collision.add(key);
  else collision.delete(key);
  markDirty();
}

function setTool(next) {
  tool = next;
  document.querySelectorAll('.tool').forEach(button => button.classList.toggle('active', button.dataset.tool === tool));
  document.querySelector('#status-tool').textContent = TOOL_LABELS[tool];
  mapCanvas.style.cursor = tool === 'pan' ? 'grab' : tool === 'eraser' ? 'cell' : 'crosshair';
}

function markDirty() { document.querySelector('#save-state').textContent = 'Nicht gespeichert'; drawMap(); }

function readLibrary() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LIBRARY_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLibrary(maps) {
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(maps));
}

function nextMapId(maps) {
  const base = Date.now().toString(36);
  let suffix = 0;
  let id = base;
  while (maps.some(entry => entry.id === id)) id = `${base}-${++suffix}`;
  return id;
}

function migrateLegacySave() {
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  const library = readLibrary();
  if (!legacy) return;
  if (library.length) {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return;
  }
  try {
    const savedAt = Date.now();
    library.push({ id: nextMapId(library), name: 'Meine erste Map', updatedAt: savedAt, state: JSON.parse(legacy) });
    writeLibrary(library);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ein beschädigter alter Speicherstand soll den Editor nicht blockieren.
  }
}

function openMapLibrary() {
  ensureLibraryThumbnails();
  renderMapLibrary();
  const dialog = document.querySelector('#maps-dialog');
  if (!dialog.open) dialog.showModal();
  requestAnimationFrame(() => document.querySelector('#map-name').focus());
}

function closeMapLibrary() {
  document.querySelector('#maps-dialog').close();
}

function saveNewMap(name) {
  const cleanName = name.trim();
  if (!cleanName) return toast('Bitte gib der Map einen Namen');
  const library = readLibrary();
  const id = nextMapId(library);
  const state = serializableState();
  library.unshift({ id, name: cleanName, updatedAt: Date.now(), state, thumbnail: captureThumbnail(state) });
  writeLibrary(library);
  currentMapId = id;
  document.querySelector('#map-name').value = '';
  document.querySelector('#save-state').textContent = `Gespeichert: ${cleanName}`;
  renderMapLibrary();
  toast(`„${cleanName}“ gespeichert`);
}

function overwriteMap(id) {
  const library = readLibrary();
  const entry = library.find(item => item.id === id);
  if (!entry) return;
  entry.state = serializableState();
  entry.thumbnail = captureThumbnail(entry.state);
  entry.updatedAt = Date.now();
  writeLibrary(library);
  currentMapId = id;
  document.querySelector('#save-state').textContent = `Gespeichert: ${entry.name}`;
  renderMapLibrary();
  toast(`„${entry.name}“ überschrieben`);
}

function loadSavedMap(id) {
  const entry = readLibrary().find(item => item.id === id);
  if (!entry) return;
  pushHistory();
  restoreState(entry.state);
  currentMapId = id;
  document.querySelector('#save-state').textContent = `Geladen: ${entry.name}`;
  closeMapLibrary();
  toast(`„${entry.name}“ geladen`);
}

function deleteSavedMap(id) {
  const library = readLibrary();
  const entry = library.find(item => item.id === id);
  if (!entry || !confirm(`„${entry.name}“ wirklich löschen?`)) return;
  writeLibrary(library.filter(item => item.id !== id));
  if (currentMapId === id) {
    currentMapId = null;
    document.querySelector('#save-state').textContent = 'Nicht gespeichert';
  }
  renderMapLibrary();
  toast(`„${entry.name}“ gelöscht`);
}

function ensureLibraryThumbnails() {
  const library = readLibrary();
  let changed = false;
  for (const entry of library) {
    if (entry.thumbnail?.startsWith('data:image/png') || !entry.state?.map || !Array.isArray(entry.state.layers)) continue;
    entry.thumbnail = captureThumbnail(entry.state);
    changed = true;
  }
  if (changed) writeLibrary(library);
}

function renderMapLibrary() {
  const library = readLibrary().sort((a, b) => b.updatedAt - a.updatedAt);
  const root = document.querySelector('#saved-maps');
  root.replaceChildren();
  document.querySelector('#map-count').textContent = `${library.length} Map${library.length === 1 ? '' : 's'}`;
  if (!library.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-library';
    const title = document.createElement('strong');
    title.textContent = 'Noch keine Maps gespeichert';
    const text = document.createElement('span');
    text.textContent = 'Vergib oben einen Namen für deine aktuelle Map.';
    empty.append(title, text);
    root.append(empty);
    return;
  }

  const dateFormat = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
  for (const entry of library) {
    const row = document.createElement('article');
    row.className = `saved-map${entry.id === currentMapId ? ' current' : ''}`;
    const preview = document.createElement('img');
    preview.className = 'map-preview';
    preview.alt = `Vorschau von ${entry.name}`;
    preview.src = entry.thumbnail || '';
    const info = document.createElement('div');
    info.className = 'map-info';
    const name = document.createElement('strong');
    name.textContent = entry.name;
    const meta = document.createElement('span');
    const tileCount = entry.state.layers.reduce((sum, layer) => sum + layer.placements.length, 0);
    meta.textContent = `${tileCount} Platzierungen · ${dateFormat.format(entry.updatedAt)}`;
    info.append(name, meta);
    const actions = document.createElement('div');
    actions.className = 'map-actions';
    const loadButton = document.createElement('button');
    loadButton.textContent = 'Laden';
    loadButton.addEventListener('click', () => loadSavedMap(entry.id));
    const overwriteButton = document.createElement('button');
    overwriteButton.textContent = 'Überschreiben';
    overwriteButton.addEventListener('click', () => overwriteMap(entry.id));
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-map';
    deleteButton.textContent = 'Löschen';
    deleteButton.addEventListener('click', () => deleteSavedMap(entry.id));
    actions.append(loadButton, overwriteButton, deleteButton);
    row.append(preview, info, actions);
    root.append(row);
  }
}

function exportMap() {
  const blob = new Blob([JSON.stringify(serializableState(), null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'idlekin-map.json';
  link.click();
  URL.revokeObjectURL(link.href);
  toast('Map als JSON exportiert');
}

function syncMapControls() {
  document.querySelector('#map-cols').value = map.columns;
  document.querySelector('#map-rows').value = map.rows;
  document.querySelector('#background').value = map.background;
}

function toast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 1800);
}

function bindEvents() {
  document.querySelectorAll('.tool').forEach(button => button.addEventListener('click', () => setTool(button.dataset.tool)));
  document.querySelector('#sheet').addEventListener('change', event => {
    activeSheet = event.target.value;
    selection = { x: 0, y: 0, width: 1, height: 1 };
    if (activeSheetDefinition().group === 'Props & Dekoration') {
      activeLayerId = 'decoration';
      renderLayers();
    }
    renderPalette();
    document.querySelector('#palette-scroll').scrollTo(0, 0);
  });
  document.querySelector('#background').addEventListener('change', event => { pushHistory(); map.background = event.target.value; markDirty(); });
  document.querySelector('#zoom').addEventListener('change', applyZoom);
  document.querySelector('#show-grid').addEventListener('change', drawMap);
  document.querySelector('#show-collision').addEventListener('change', drawMap);
  document.querySelector('#center-map').addEventListener('click', () => {
    stage.scrollTo({ left: Math.max(0, (stage.scrollWidth - stage.clientWidth) / 2), top: Math.max(0, (stage.scrollHeight - stage.clientHeight) / 2), behavior: 'smooth' });
  });
  document.querySelector('#undo').addEventListener('click', undo);
  document.querySelector('#play-map').addEventListener('click', playCurrentMap);
  document.querySelector('#redo').addEventListener('click', redo);
  document.querySelector('#save').addEventListener('click', openMapLibrary);
  document.querySelector('#load').addEventListener('click', openMapLibrary);
  document.querySelector('#close-maps').addEventListener('click', closeMapLibrary);
  document.querySelector('#new-map-form').addEventListener('submit', event => {
    event.preventDefault();
    saveNewMap(document.querySelector('#map-name').value);
  });
  document.querySelector('#maps-dialog').addEventListener('click', event => {
    if (event.target === event.currentTarget) closeMapLibrary();
  });
  document.querySelector('#export').addEventListener('click', exportMap);
  document.querySelector('#import').addEventListener('click', () => document.querySelector('#import-file').click());
  document.querySelector('#import-file').addEventListener('change', async event => {
    const [file] = event.target.files;
    if (!file) return;
    try { pushHistory(); restoreState(JSON.parse(await file.text())); toast('Map importiert'); }
    catch (error) { toast(error.message); }
    event.target.value = '';
  });
  document.querySelector('#resize-map').addEventListener('click', () => {
    pushHistory();
    map.columns = Math.max(8, Math.min(200, Number(document.querySelector('#map-cols').value) || 30));
    map.rows = Math.max(6, Math.min(120, Number(document.querySelector('#map-rows').value) || 17));
    for (const layer of layers) layer.placements = layer.placements.filter(item => item.x < map.columns && item.y < map.rows);
    collision = new Set([...collision].filter(entry => { const [x, y] = entry.split(',').map(Number); return x < map.columns && y < map.rows; }));
    resizeCanvas(); renderLayers(); markDirty(); toast('Map-Größe geändert');
  });
  document.querySelector('#clear-map').addEventListener('click', () => {
    if (!confirm('Alle platzierten Tiles und Kollisionen löschen?')) return;
    pushHistory();
    layers.forEach(layer => { layer.placements = []; });
    collision.clear(); renderLayers(); markDirty(); toast('Map geleert');
  });

  paletteCanvas.addEventListener('pointerdown', event => {
    if (event.isPrimary) {
      try { paletteCanvas.setPointerCapture(event.pointerId); } catch { /* synthetische Tests besitzen keinen aktiven Pointer */ }
    }
    paletteDragStart = paletteCell(event);
    selection = { ...paletteDragStart, width: 1, height: 1 };
    renderPalette();
  });
  paletteCanvas.addEventListener('pointermove', event => {
    if (!paletteDragStart) return;
    const end = paletteCell(event);
    selection = {
      x: Math.min(paletteDragStart.x, end.x), y: Math.min(paletteDragStart.y, end.y),
      width: Math.abs(end.x - paletteDragStart.x) + 1, height: Math.abs(end.y - paletteDragStart.y) + 1,
    };
    renderPalette();
  });
  paletteCanvas.addEventListener('pointerup', () => { paletteDragStart = null; });

  mapCanvas.addEventListener('pointerdown', event => {
    pointerDown = true;
    if (event.isPrimary) {
      try { mapCanvas.setPointerCapture(event.pointerId); } catch { /* siehe Palette */ }
    }
    const cell = mapCell(event);
    lastPaintCell = cell;
    if (tool === 'pan') {
      panStart = { x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop };
      mapCanvas.style.cursor = 'grabbing';
      return;
    }
    if (tool === 'picker') return pickAt(cell);
    pushHistory();
    if (tool === 'pencil') placeAt(cell);
    if (tool === 'eraser') eraseAt(cell);
    if (tool === 'collision') toggleCollision(cell);
    if (tool === 'rectangle') rectangleStart = rectangleEnd = cell;
    drawMap();
  });
  mapCanvas.addEventListener('pointermove', event => {
    const cell = mapCell(event);
    document.querySelector('#status-position').textContent = `X ${cell.x} · Y ${cell.y}`;
    if (!pointerDown) return;
    if (tool === 'pan' && panStart) {
      stage.scrollLeft = panStart.left - (event.clientX - panStart.x);
      stage.scrollTop = panStart.top - (event.clientY - panStart.y);
      return;
    }
    if (lastPaintCell?.x === cell.x && lastPaintCell?.y === cell.y) return;
    lastPaintCell = cell;
    if (tool === 'pencil') placeAt(cell);
    if (tool === 'eraser') eraseAt(cell);
    if (tool === 'collision') toggleCollision(cell, true);
    if (tool === 'rectangle') { rectangleEnd = cell; drawMap(); }
  });
  mapCanvas.addEventListener('pointerup', () => {
    if (tool === 'rectangle' && rectangleStart && rectangleEnd) paintRectangle();
    pointerDown = false; lastPaintCell = null; rectangleStart = null; rectangleEnd = null; panStart = null;
    mapCanvas.style.cursor = tool === 'pan' ? 'grab' : 'crosshair'; drawMap();
  });

  window.addEventListener('keydown', event => {
    if (event.target.matches('input, select')) return;
    if (event.ctrlKey && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); return; }
    if (event.ctrlKey && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); return; }
    if (event.code === 'Space' && !previousTool) { event.preventDefault(); previousTool = tool; setTool('pan'); return; }
    const shortcut = { b: 'pencil', e: 'eraser', r: 'rectangle', i: 'picker', c: 'collision', h: 'pan' }[event.key.toLowerCase()];
    if (shortcut) setTool(shortcut);
  });
  window.addEventListener('keyup', event => {
    if (event.code === 'Space' && previousTool) { setTool(previousTool); previousTool = null; }
  });
}

async function start() {
  const sheetSelect = document.querySelector('#sheet');
  for (const groupName of [...new Set(SHEETS.map(sheet => sheet.group))]) {
    const group = document.createElement('optgroup');
    group.label = groupName;
    for (const sheet of SHEETS.filter(entry => entry.group === groupName)) {
      group.append(new Option(`${sheet.label} · ${sheet.gridSize}px`, sheet.file));
    }
    sheetSelect.append(group);
  }
  const backgroundSelect = document.querySelector('#background');
  backgroundSelect.add(new Option('Kein Hintergrund', ''));
  for (const background of BACKGROUNDS) backgroundSelect.add(new Option(background.label, background.file));

  const loadedSheets = await Promise.all(SHEETS.map(async sheet => [sheet.file, await imageFrom(sheet.src)]));
  loadedSheets.forEach(([file, image]) => sheetImages.set(file, image));
  const loadedBackgrounds = await Promise.all(BACKGROUNDS.map(async background => [background.file, await imageFrom(background.src)]));
  loadedBackgrounds.forEach(([file, image]) => backgroundImages.set(file, image));

  bindEvents();
  migrateLegacySave();
  syncMapControls();
  renderLayers();
  resizeCanvas();
  renderPalette();
  updateHistoryButtons();
  requestAnimationFrame(() => document.querySelector('#center-map').click());
}

start().catch(error => {
  console.error(error);
  document.querySelector('#toast').textContent = error.message;
  document.querySelector('#toast').classList.add('show');
});
