export const PLAYER_FRAME = 128;
export const PLAYER_ANIMATIONS = {
  idle:{row:1,frames:10,fps:8,loop:true}, walk:{row:2,frames:10,fps:10,loop:true}, run:{row:3,frames:10,fps:14,loop:true},
  jump:{row:4,frames:6,fps:12,loop:false}, fall:{row:5,frames:4,fps:10,loop:false}, fall_loop:{row:6,frames:3,fps:8,loop:true},
} as const;
export type PlayerAnimation = keyof typeof PLAYER_ANIMATIONS;
