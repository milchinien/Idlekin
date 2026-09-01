import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const referencePath = path.join(root, "assets", "Plattform Referenz", "Sprite-0001.png");
const worldRoot = path.join(root, "assets", "world");

const tile = 64;
const middleCount = 10;
const columns = middleCount + 2;
const rows = 4;
const atlasWidth = columns * tile;
const atlasHeight = rows * tile;

const biomes = ["meadow-mountains", "meadow-forest", "red-brown-cave", "jungle"];

const { data: source, info } = await sharp(referencePath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

let minX = info.width;
let minY = info.height;
let maxX = -1;
let maxY = -1;
for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    if (source[(y * info.width + x) * 4 + 3] === 0) continue;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
}

if (maxX < minX || maxY < minY) throw new Error("The platform reference is empty.");

const contentWidth = maxX - minX + 1;
const contentHeight = maxY - minY + 1;
const getPixel = (x, y) => {
  const clampedX = Math.max(0, Math.min(contentWidth - 1, x));
  const clampedY = Math.max(0, Math.min(contentHeight - 1, y));
  const offset = ((minY + clampedY) * info.width + minX + clampedX) * 4;
  return [source[offset], source[offset + 1], source[offset + 2], source[offset + 3]];
};

const mirrorRepeat = (value, length) => {
  if (length <= 1) return 0;
  const period = (length - 1) * 2;
  const wrapped = ((value % period) + period) % period;
  return wrapped < length ? wrapped : period - wrapped;
};

const isReferenceGrass = (pixel, y) =>
  y < 54 && pixel[3] > 0 && pixel[1] > pixel[0] * 1.02 && pixel[1] > pixel[2] * 1.08;

for (const biome of biomes) {
  const atlas = Buffer.alloc(atlasWidth * atlasHeight * 4);
  const put = (column, row, x, y, pixel) => {
    const offset = (((row * tile + y) * atlasWidth) + column * tile + x) * 4;
    atlas[offset] = pixel[0];
    atlas[offset + 1] = pixel[1];
    atlas[offset + 2] = pixel[2];
    atlas[offset + 3] = pixel[3];
  };

  const sampleX = (column, x) => {
    if (column === 0) return Math.min(contentWidth - 1, x);
    if (column === columns - 1) return Math.min(contentWidth - 1, tile - 1 - x);
    const flatStart = Math.min(64, contentWidth - 1);
    const flatWidth = Math.max(1, contentWidth - flatStart);
    return flatStart + mirrorRepeat((column - 1) * tile + x, flatWidth);
  };

  for (let column = 0; column < columns; column += 1) {
    for (let y = 0; y < tile; y += 1) {
      for (let x = 0; x < tile; x += 1) {
        const sx = sampleX(column, x);
        // Die komplette Plattform (nicht nur ihr oberer Grasbereich) wird auf
        // eine Atlaszeile abgebildet. Der Renderer skaliert diese Zeile einmal
        // auf die echte Rechteckhoehe; dadurch bleiben die Proportionen der
        // Referenz erhalten und 40-px-Boeden bestehen nicht fast nur aus Gras.
        const fullY = Math.round((y / (tile - 1)) * (contentHeight - 1));
        const surfaceSource = getPixel(sx, fullY);
        put(column, 0, x, y, surfaceSource);

        const bodyY = Math.min(contentHeight - 1, tile + y);
        const bodySource = getPixel(sx, bodyY);
        put(column, 1, x, y, bodySource);

        // Beide Halmreihen stammen direkt aus derselben Rasenkante. Sie werden
        // nur freigestellt und nach unten versetzt, damit sie am Kollisionsrand
        // hinter bzw. vor den Fuessen liegen – keine zweite Grasmatte.
        if (y >= 16 && y < 45) {
          const bladeY = y - 16;
          const bladeSource = getPixel(sx, bladeY);
          if (isReferenceGrass(bladeSource, bladeY)) {
            put(column, 2, x, y, bladeSource);

            const globalX = column * tile + x;
            const foregroundCluster = [1, 4].includes(Math.floor(globalX / 11) % 7);
            if (foregroundCluster && bladeY < 15) put(column, 3, x, y, bladeSource);
          }
        }
      }
    }
  }

  const target = path.join(worldRoot, biome, "tiles", "platform-tileset-surface.png");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await sharp(atlas, {
    raw: { width: atlasWidth, height: atlasHeight, channels: 4 },
  }).png().toFile(target);
  console.log(`Built ${path.relative(root, target)} from ${path.relative(root, referencePath)}`);
}
