// Parameter-Definitionen, Slider-UI und Persistenz.
// Der eigentliche Zweck des Prototyps: alles zur Laufzeit justieren koennen,
// ohne Reload und ohne Code anzufassen.

const PARAM_DEFS = [
  { g: 'Laufen',  k: 'maxSpeed',    l: 'Max. Geschwindigkeit', min: 20,  max: 400,  step: 5,    u: 'px/s' },
  { g: 'Laufen',  k: 'accel',       l: 'Beschleunigung',       min: 100, max: 5000, step: 50,   u: 'px/s2' },
  { g: 'Laufen',  k: 'friction',    l: 'Bremsen (Boden)',      min: 100, max: 6000, step: 50,   u: 'px/s2' },
  { g: 'Sprung',  k: 'jumpVel',     l: 'Sprungkraft',          min: 50,  max: 600,  step: 5,    u: 'px/s' },
  { g: 'Sprung',  k: 'gravity',     l: 'Gravitation',          min: 200, max: 3000, step: 25,   u: 'px/s2' },
  { g: 'Sprung',  k: 'fallMult',    l: 'Fall-Multiplikator',   min: 1,   max: 4,    step: 0.05, u: 'x' },
  { g: 'Sprung',  k: 'lowJumpMult', l: 'Kurzsprung (loslassen)', min: 1, max: 6,    step: 0.05, u: 'x' },
  { g: 'Sprung',  k: 'maxFall',     l: 'Max. Fallgeschw.',     min: 100, max: 1500, step: 25,   u: 'px/s' },
  // Apex: kurz vor dem Scheitelpunkt weniger Gravitation = spuerbare "Hangtime".
  { g: 'Apex',    k: 'apexThresh',  l: 'Apex-Fenster',         min: 0,   max: 150,  step: 5,    u: 'px/s' },
  { g: 'Apex',    k: 'apexGravity', l: 'Apex-Gravitation',     min: 0.2, max: 1,    step: 0.05, u: 'x' },
  { g: 'Apex',    k: 'apexControl', l: 'Apex-Luftkontrolle',   min: 1,   max: 2,    step: 0.05, u: 'x' },
  { g: 'Luft',    k: 'airControl',  l: 'Luftkontrolle',        min: 0,   max: 1,    step: 0.05, u: 'x' },
  { g: 'Luft',    k: 'airFriction', l: 'Bremsen (Luft)',       min: 0,   max: 3000, step: 25,   u: 'px/s2' },
  { g: 'Assists', k: 'coyote',      l: 'Coyote Time',          min: 0,   max: 0.3,  step: 0.01, u: 's' },
  { g: 'Assists', k: 'buffer',      l: 'Sprung-Puffer',        min: 0,   max: 0.3,  step: 0.01, u: 's' },
  { g: 'Assists', k: 'cornerFix',   l: 'Ecken-Korrektur',      min: 0,   max: 8,    step: 1,    u: 'px' },
  { g: 'Kamera',  k: 'camSmooth',   l: 'Kamera-Glaettung',     min: 1,   max: 25,   step: 0.5,  u: '1/s' },
  { g: 'Welt',    k: 'bgParallax',  l: 'Hintergrund-Parallaxe', min: 0,  max: 1,    step: 0.05, u: 'x' },
  { g: 'Optik',   k: 'squash',      l: 'Squash & Stretch',     min: 0,   max: 1,    step: 0.05, u: 'x' },
  { g: 'Optik',   k: 'shake',       l: 'Screenshake (Landung)', min: 0,  max: 1,    step: 0.05, u: 'x' },
  { g: 'Optik',   k: 'interp',      l: 'Render-Interpolation', t: 'bool' },
];

// Drei bewusst unterschiedliche Ausgangspunkte zum Vergleichen.
// "IdleOn-nah" ist die Schaetzung fuer das Zielgefuehl und die Voreinstellung.
const PRESETS = {
  'IdleOn-nah': {
    maxSpeed: 150, accel: 1200, friction: 1600,
    jumpVel: 330, gravity: 1100, fallMult: 1.4, lowJumpMult: 2.0, maxFall: 700,
    apexThresh: 60, apexGravity: 0.55, apexControl: 1.25,
    airControl: 0.8, airFriction: 400,
    coyote: 0.08, buffer: 0.10, cornerFix: 4,
    camSmooth: 9,  bgParallax: 0.25,
    squash: 0.35, shake: 0.4, interp: 1,
  },
  'Snappy': {
    maxSpeed: 190, accel: 3000, friction: 4000,
    jumpVel: 340, gravity: 1500, fallMult: 1.8, lowJumpMult: 3.0, maxFall: 800,
    apexThresh: 70, apexGravity: 0.45, apexControl: 1.4,
    airControl: 0.9, airFriction: 1200,
    coyote: 0.10, buffer: 0.12, cornerFix: 6,
    camSmooth: 14, bgParallax: 0.35,
    squash: 0.5, shake: 0.6, interp: 1,
  },
  'Floaty': {
    maxSpeed: 120, accel: 500, friction: 400,
    jumpVel: 280, gravity: 600, fallMult: 1.1, lowJumpMult: 1.4, maxFall: 400,
    apexThresh: 40, apexGravity: 0.8, apexControl: 1.1,
    airControl: 0.5, airFriction: 100,
    coyote: 0.15, buffer: 0.15, cornerFix: 2,
    camSmooth: 5,  bgParallax: 0.15,
    squash: 0.2, shake: 0.15, interp: 1,
  },
  // Zum Vergleichen: alle Komfortfunktionen aus. Zeigt, was sie tatsaechlich bringen.
  'Roh (ohne Hilfen)': {
    maxSpeed: 150, accel: 1200, friction: 1600,
    jumpVel: 330, gravity: 1100, fallMult: 1.0, lowJumpMult: 1.0, maxFall: 700,
    apexThresh: 0, apexGravity: 1, apexControl: 1,
    airControl: 0.8, airFriction: 400,
    coyote: 0, buffer: 0, cornerFix: 0,
    camSmooth: 25, bgParallax: 0,
    squash: 0, shake: 0, interp: 0,
  },
};

const DEFAULT_PRESET = 'IdleOn-nah';
const STORAGE_KEY = 'proto01-tuning';

// Laufzeit-Werte. main.js liest ausschliesslich hier heraus.
const P = Object.assign({}, PRESETS[DEFAULT_PRESET]);

const Tuning = (() => {
  const inputs = {};
  let activePreset = DEFAULT_PRESET;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      for (const d of PARAM_DEFS) {
        if (typeof saved[d.k] === 'number') P[d.k] = saved[d.k];
      }
      activePreset = saved._preset || null;
    } catch (e) {
      // Kaputter localStorage darf den Prototyp nicht blockieren.
      console.warn('Tuning konnte nicht geladen werden:', e);
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...P, _preset: activePreset }));
    } catch (e) { /* z.B. privater Modus - egal */ }
  }

  function fmt(d) {
    if (d.t === 'bool') return P[d.k] ? 'an' : 'aus';
    const dec = d.step < 1 ? 2 : 0;
    return `${P[d.k].toFixed(dec)} ${d.u}`;
  }

  function buildSliders(root) {
    let lastGroup = null;
    for (const d of PARAM_DEFS) {
      if (d.g !== lastGroup) {
        const h = document.createElement('div');
        h.className = 'group-title';
        h.textContent = d.g;
        root.appendChild(h);
        lastGroup = d.g;
      }

      const row = document.createElement('div');
      row.className = 'row';

      const label = document.createElement('label');
      const name = document.createElement('span');
      name.textContent = d.l;
      const val = document.createElement('span');
      val.className = 'val';
      val.textContent = fmt(d);
      label.append(name, val);

      const input = document.createElement('input');
      if (d.t === 'bool') {
        input.type = 'checkbox';
        input.checked = !!P[d.k];
      } else {
        input.type = 'range';
        input.min = d.min; input.max = d.max; input.step = d.step;
        input.value = P[d.k];
      }
      input.addEventListener('input', () => {
        // Bools werden als 0/1 gehalten, damit Presets und JSON-Export einheitlich bleiben.
        P[d.k] = d.t === 'bool' ? (input.checked ? 1 : 0) : parseFloat(input.value);
        val.textContent = fmt(d);
        setActivePreset(null); // manuell veraendert - kein Preset mehr
        save();
      });

      row.append(label, input);
      root.appendChild(row);
      inputs[d.k] = { input, val, def: d };
    }
  }

  function refresh() {
    for (const d of PARAM_DEFS) {
      const e = inputs[d.k];
      if (!e) continue;
      if (d.t === 'bool') e.input.checked = !!P[d.k];
      else e.input.value = P[d.k];
      e.val.textContent = fmt(d);
    }
  }

  function setActivePreset(name) {
    activePreset = name;
    for (const btn of document.querySelectorAll('#presets button')) {
      btn.classList.toggle('active', btn.dataset.preset === name);
    }
  }

  function applyPreset(name) {
    Object.assign(P, PRESETS[name]);
    refresh();
    setActivePreset(name);
    save();
  }

  function buildPresets(root) {
    for (const name of Object.keys(PRESETS)) {
      const btn = document.createElement('button');
      btn.textContent = name;
      btn.dataset.preset = name;
      btn.addEventListener('click', () => applyPreset(name));
      root.appendChild(btn);
    }
  }

  function exportJSON() {
    const out = {};
    for (const d of PARAM_DEFS) out[d.k] = P[d.k];
    const text = JSON.stringify(out, null, 2);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => console.log(text));
    } else {
      // file:// hat keine Clipboard-API - Konsole tut es auch.
      console.log(text);
    }
    return text;
  }

  function init() {
    load();
    buildPresets(document.getElementById('presets'));
    buildSliders(document.getElementById('sliders'));
    setActivePreset(activePreset);

    document.getElementById('btn-export').addEventListener('click', e => {
      exportJSON();
      const b = e.currentTarget;
      const old = b.textContent;
      b.textContent = 'kopiert (auch in Konsole)';
      setTimeout(() => { b.textContent = old; }, 1400);
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      applyPreset(DEFAULT_PRESET);
    });
  }

  return { init, applyPreset };
})();
