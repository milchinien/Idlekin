// Kleines Hilfsskript: listet Abmessungen aller PNGs unter assets/.
import fs from 'node:fs';
import path from 'node:path';

const walk = dir =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

const root = process.argv[2] || 'assets';
for (const file of walk(root).filter(f => f.toLowerCase().endsWith('.png'))) {
  const buf = fs.readFileSync(file);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  console.log(`${String(w).padStart(5)} x ${String(h).padStart(4)}  ${file.split(path.sep).join('/')}`);
}
