import type { AreaId, CharacterId } from './ids.js';

export interface CharacterSnapshot {
  id: CharacterId;
  name: string;
  level: number;
  experience: number;
  areaId: AreaId;
  x: number;
  y: number;
}
