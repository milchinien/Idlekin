import type { CharacterSnapshot, PlayerId, PlayerSnapshot } from '@idlekin/shared';
import { characterRepository } from '../db/characterRepository.js';
import { playerRepository } from '../db/playerRepository.js';

class PlayerService {
  private readonly active = new Map<PlayerId, PlayerSnapshot>();
  load(id: PlayerId): PlayerSnapshot {
    const cached = this.active.get(id); if (cached) return cached;
    const player = playerRepository.find(id); if (!player) throw new Error('Spieler nicht gefunden');
    characterRepository.ensureFirst(id);
    const state: PlayerSnapshot = { id, name: player.name, currency: player.currency, characters: characterRepository.list(id) };
    this.active.set(id, state); return state;
  }
  character(playerId: PlayerId, characterId: string): CharacterSnapshot | undefined { return this.load(playerId).characters.find(character => character.id === characterId); }
  save(playerId: PlayerId) { const player = this.active.get(playerId); if (!player) return; for (const character of player.characters) characterRepository.save(character); playerRepository.touch(playerId); }
  unload(playerId: PlayerId) { this.save(playerId); this.active.delete(playerId); }
  saveAll() { for (const id of this.active.keys()) this.save(id); }
}
export const playerService = new PlayerService();
