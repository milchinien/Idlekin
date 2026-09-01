import { describe, expect, it } from 'vitest';
import { ContentRegistry, type Area, type CharacterSnapshot } from '@idlekin/shared';
import { enterPortal } from './areaSystem.js';

const base = { size:{width:500,height:270},tileSize:16,layers:[],collision:{solids:[],platforms:[]},nodes:[],enemies:[] };
const source = { ...base, id:'area.a',name:'A',spawns:[{id:'spawn.default',x:10,y:210}],portals:[{id:'portal.a.b',targetArea:'area.b',targetSpawn:'spawn.fromA',position:{x:100,y:230},requirement:null}] } as Area;
const target = { ...base, id:'area.b',name:'B',spawns:[{id:'spawn.fromA',x:40,y:210}],portals:[] } as Area;
const registry = new ContentRegistry([source,target]);
const character = (x:number):CharacterSnapshot => ({id:'character.test' as never,name:'Kin',level:1,experience:0,areaId:'area.a' as never,x,y:210});
describe('Portale',()=>{
  it('wechselt serverseitig Gebiet und Einstiegspunkt',()=>{const value=character(94);const area=enterPortal(value,'portal.a.b',registry);expect(area.id).toBe('area.b');expect(value).toMatchObject({areaId:'area.b',x:40,y:210});});
  it('weist einen manipulierten Fernzugriff ab',()=>expect(()=>enterPortal(character(400),'portal.a.b',registry)).toThrow('zu weit'));
});
