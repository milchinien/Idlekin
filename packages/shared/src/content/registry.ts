import type { Area, AreaId } from '../index.js';

export class ContentRegistry {
  readonly areas: ReadonlyMap<AreaId, Area>;
  constructor(areas: Area[]) { this.areas = new Map(areas.map(area => [area.id, Object.freeze(area)])); }
  area(id: AreaId): Area {
    const area = this.areas.get(id);
    if (!area) throw new Error(`Unbekanntes Gebiet: ${id}`);
    return area;
  }
}
