import type { PlayerId } from './ids.js';
import type { CharacterSnapshot } from './character.js';

export interface PlayerSnapshot {
  id: PlayerId;
  name: string;
  currency: number;
  characters: CharacterSnapshot[];
}
