import { describe, expect, it } from 'vitest';
import type { Area, CharacterSnapshot } from '@idlekin/shared';
import { ensureValidPosition } from './movementSystem.js';
const area={id:'area.test',name:'Test',size:{width:480,height:270},tileSize:16,layers:[],collision:{solids:[],platforms:[]},spawns:[{id:'spawn.default',x:20,y:200}],portals:[],nodes:[],enemies:[]} as Area;
describe('Bewegungssystem',()=>{it('rettet gespeicherte Positionen unter der Welt',()=>{const character={id:'c' as never,name:'Kin',level:1,experience:0,areaId:'area.test' as never,x:100,y:900} as CharacterSnapshot;ensureValidPosition(character,area);expect(character).toMatchObject({x:20,y:200});});});
