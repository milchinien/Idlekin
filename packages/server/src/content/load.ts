import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { areaSchema, ContentRegistry, type Area } from '@idlekin/shared';

export function loadContent(root = fileURLToPath(new URL('../../../../content', import.meta.url))): ContentRegistry {
  const folder = `${root}/areas`;
  const areas = readdirSync(folder).filter(name => name.endsWith('.json')).map(name => {
    const file = `${folder}/${name}`;
    let raw: unknown;
    try { raw = JSON.parse(readFileSync(file, 'utf8')); } catch (error) { throw new Error(`${file}: ungültiges JSON`, { cause: error }); }
    const result = areaSchema.safeParse(raw);
    if (!result.success) throw new Error(`${file}: ${result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
    return result.data as Area;
  });
  const ids = new Set(areas.map(area => area.id));
  for (const area of areas) {
    const within = (rect: { x: number; y: number; w: number; h: number }) => rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= area.size.width && rect.y + rect.h <= area.size.height;
    for (const rect of [...area.collision.solids, ...area.collision.platforms]) if (!within(rect)) throw new Error(`${area.id}: Kollisionsrechteck liegt außerhalb des Gebiets`);
    for (const spawn of area.spawns) {
      if (spawn.x < 0 || spawn.y < 0 || spawn.x > area.size.width || spawn.y > area.size.height) throw new Error(`${area.id}: Einstiegspunkt ${spawn.id} liegt außerhalb des Gebiets`);
      if (area.collision.solids.some(rect => spawn.x < rect.x + rect.w && spawn.x + 12 > rect.x && spawn.y < rect.y + rect.h && spawn.y + 20 > rect.y)) throw new Error(`${area.id}: Einstiegspunkt ${spawn.id} liegt in Kollision`);
    }
    for (const portal of area.portals) {
      if (!ids.has(portal.targetArea)) throw new Error(`${area.id}: Portal verweist auf unbekanntes Gebiet ${portal.targetArea}`);
      const target = areas.find(candidate => candidate.id === portal.targetArea);
      if (!target?.spawns.some(spawn => spawn.id === portal.targetSpawn)) throw new Error(`${area.id}: Portal verweist auf unbekannten Einstiegspunkt ${portal.targetSpawn}`);
    }
  }
  return new ContentRegistry(areas);
}
