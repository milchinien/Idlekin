import type { AreaId, PortalId } from './ids.js';

export interface Rect { x: number; y: number; w: number; h: number }
export interface AreaLayer {
  kind: 'background' | 'tiles' | 'foreground';
  image: string;
  parallax: number;
}
export interface AreaSpawn { id: string; x: number; y: number }
export interface Portal {
  id: PortalId;
  targetArea: AreaId;
  targetSpawn: string;
  position: { x: number; y: number };
  requirement: string | null;
}
export interface Area {
  id: AreaId;
  name: string;
  size: { width: number; height: number };
  tileSize: number;
  layers: AreaLayer[];
  collision: { solids: Rect[]; platforms: Rect[] };
  spawns: AreaSpawn[];
  portals: Portal[];
  nodes: unknown[];
  enemies: unknown[];
}
