import { playerRepository } from './playerRepository.js';
playerRepository.findOrCreate('Spieler');
console.log('Entwicklungsspieler ist vorhanden.');
