import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const PROTO_DIR = 'prototypes';

/**
 * Liest Titel und Fragestellung aus der NOTES.md eines Prototyps.
 * Faellt still auf den Ordnernamen zurueck - ein Prototyp ohne Notizen
 * soll trotzdem im Menue auftauchen.
 */
function readMeta(dir, slug) {
  const meta = { title: slug, question: '' };
  const notes = path.join(dir, 'NOTES.md');
  if (!fs.existsSync(notes)) return meta;

  try {
    const text = fs.readFileSync(notes, 'utf8');

    const heading = text.match(/^#\s+(.+)$/m);
    if (heading) meta.title = heading[1].trim();

    // Erste nicht-leere Zeile unter "## Frage"
    const section = text.split(/^##\s+/m).find(s => /^Frage\s*$/m.test(s.split('\n')[0]));
    if (section) {
      const line = section
        .split('\n')
        .slice(1)
        .map(l => l.trim())
        .find(l => l && !l.startsWith('#'));
      if (line) meta.question = line.replace(/\*\*/g, '');
    }
  } catch {
    // Unlesbare NOTES.md darf das Menue nicht kaputt machen.
  }
  return meta;
}

function listPrototypes(root) {
  const base = path.join(root, PROTO_DIR);
  if (!fs.existsSync(base)) return [];

  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter(e => e.isDirectory())
    // "_template" und Verstecktes gehoeren nicht ins Menue.
    .filter(e => !e.name.startsWith('_') && !e.name.startsWith('.'))
    .filter(e => fs.existsSync(path.join(base, e.name, 'index.html')))
    .map(e => ({ slug: e.name, ...readMeta(path.join(base, e.name), e.name) }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

const escapeHtml = s =>
  String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function renderMenu(protos) {
  const cards = protos.length
    ? protos
        .map(
          p => `      <a class="card" href="/${PROTO_DIR}/${escapeHtml(p.slug)}/">
        <span class="slug">${escapeHtml(p.slug)}</span>
        <span class="title">${escapeHtml(p.title)}</span>
        ${p.question ? `<span class="question">${escapeHtml(p.question)}</span>` : ''}
      </a>`
        )
        .join('\n')
    : `      <p class="empty">Noch keine Prototypen. Anlegen mit:
        <code>cp -r prototypes/_template prototypes/02-mein-experiment</code></p>`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Idlekin - Prototypen</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 40px 24px;
      background: #15151b; color: #cfcfd6;
      font: 14px/1.6 ui-monospace, monospace;
      display: flex; flex-direction: column; align-items: center;
    }
    .wrap { width: 100%; max-width: 760px; }
    h1 { font-size: 18px; margin: 0 0 4px; color: #fff; letter-spacing: .06em; }
    .sub { color: #6a6a78; margin: 0 0 28px; font-size: 13px; }
    .sub a { color: #7fbf9f; }
    .card {
      display: block; text-decoration: none;
      background: #1c1c24; border: 1px solid #2e2e3a;
      padding: 14px 16px; margin-bottom: 10px;
      transition: background .12s, border-color .12s;
    }
    .card:hover { background: #23232e; border-color: #4a9d7a; }
    .slug { display: block; color: #6a6a78; font-size: 11px; letter-spacing: .08em; }
    .title { display: block; color: #e6e6ef; font-size: 15px; margin-top: 2px; }
    .question { display: block; color: #7fbf9f; font-size: 12px; margin-top: 6px; }
    .empty { color: #6a6a78; }
    code { background: #23232e; padding: 2px 6px; color: #a8a8ba; }
    footer { margin-top: 28px; color: #4e4e5c; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Prototypen</h1>
    <p class="sub">Wegwerf-Experimente, unabhaengig vom Spiel. &nbsp;<a href="/">&larr; zum Spiel</a></p>
${cards}
    <footer>Das Menue liest den Ordner bei jedem Aufruf neu - neue Prototypen erscheinen ohne Konfiguration.</footer>
  </div>
</body>
</html>
`;
}

/** Serviert /prototypes/ als automatisch erzeugtes Menue. */
function prototypeMenu() {
  let root;
  return {
    name: 'idlekin:prototype-menu',
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      // Direkt in configureServer registriert = laeuft vor Vites eigener
      // HTML-Aufloesung. Sonst wuerde /prototypes/ als 404 enden.
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0];

        if (url === `/${PROTO_DIR}`) {
          res.statusCode = 301;
          res.setHeader('Location', `/${PROTO_DIR}/`);
          return res.end();
        }

        if (url !== `/${PROTO_DIR}/`) return next();

        try {
          const html = renderMenu(listPrototypes(root));
          // Durch transformIndexHtml bekommt auch diese Seite den Vite-Client
          // und damit Live-Reload.
          const out = await server.transformIndexHtml(url, html, req.originalUrl);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.end(out);
        } catch (err) {
          return next(err);
        }
      });

      // Prototypen nutzen klassische <script>-Tags, liegen also nicht im
      // Modulgraph. Ohne diesen Watcher gaebe es dort kein Live-Reload.
      const hot = server.hot ?? server.ws;
      const protoPath = path.join(root, PROTO_DIR);
      const reload = file => {
        if (!file.startsWith(protoPath)) return;
        hot?.send({ type: 'full-reload', path: '*' });
      };
      server.watcher.on('change', reload);
      server.watcher.on('add', reload);
      server.watcher.on('unlink', reload);
    },
  };
}

export default defineConfig({
  root: '.',
  appType: 'mpa',
  plugins: [prototypeMenu()],
  server: {
    // 5173 ist auf diesem Rechner haeufig belegt; 5180 haelt die URL stabil.
    port: 5180,
    open: false,
    fs: {
      // Die Muster werden gegen absolute Pfade geprueft - ohne "**/" greifen sie nicht.
      deny: ['**/.git/**', '**/node_modules/**'],
    },
  },
});
