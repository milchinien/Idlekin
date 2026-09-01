export type BrandedId<T extends string> = string & { readonly __brand: T };
export type PlayerId = BrandedId<'PlayerId'>;
export type CharacterId = BrandedId<'CharacterId'>;
export type AreaId = BrandedId<'AreaId'>;
export type PortalId = BrandedId<'PortalId'>;
