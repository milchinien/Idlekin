import { z } from 'zod';

const rect = z.object({ x: z.number().int(), y: z.number().int(), w: z.number().int().positive(), h: z.number().int().positive() });
export const areaSchema = z.object({
  id: z.string().startsWith('area.'),
  name: z.string().min(1),
  size: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }),
  tileSize: z.number().int().positive(),
  layers: z.array(z.object({ kind: z.enum(['background', 'tiles', 'foreground']), image: z.string().min(1), parallax: z.number() })),
  collision: z.object({ solids: z.array(rect), platforms: z.array(rect) }),
  spawns: z.array(z.object({ id: z.string().min(1), x: z.number().int(), y: z.number().int() })).min(1),
  portals: z.array(z.object({
    id: z.string().startsWith('portal.'), targetArea: z.string().startsWith('area.'), targetSpawn: z.string().min(1),
    position: z.object({ x: z.number().int(), y: z.number().int() }), requirement: z.string().nullable(),
  })),
  nodes: z.array(z.unknown()), enemies: z.array(z.unknown()),
});
