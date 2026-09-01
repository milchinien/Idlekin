import path from "node:path";

import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const atlasPath = path.join(root, "assets/world/meadow-mountains/tiles/platform-tileset-surface.png");
const backgroundPath = path.join(root, "assets/world/meadow-mountains/backgrounds/mountains-meadow-day.png");
const playerPath = path.join(root, "assets/player/Final Player/toUse.png");
const outputPath = path.join(root, "tools/_preview-platform-reference-exact.png");

const tileSource = 64;
const tileWorld = 32;
const columns = 12;
const platform = { x: 40, y: 220, width: 400, height: 50 };
const rise = 4;
const layers = [];

const addTile = async (column, row, left, top, width, height) => {
  const input = await sharp(atlasPath)
    .extract({ left: column * tileSource, top: row * tileSource, width: tileSource, height: tileSource })
    .resize(width, height, { fit: "fill", kernel: sharp.kernel.nearest })
    .png()
    .toBuffer();
  layers.push({ input, left, top });
};

let offset = 0;
await addTile(0, 0, platform.x, platform.y - rise, tileWorld, platform.height + rise);
offset += tileWorld;
let middle = 0;
while (offset < platform.width - tileWorld) {
  const width = Math.min(tileWorld, platform.width - tileWorld - offset);
  await addTile(1 + (middle % 10), 0, platform.x + offset, platform.y - rise, width, platform.height + rise);
  offset += width;
  middle += 1;
}
await addTile(columns - 1, 0, platform.x + platform.width - tileWorld, platform.y - rise, tileWorld, platform.height + rise);

const player = await sharp(playerPath)
  .extract({ left: 0, top: 128, width: 128, height: 128 })
  .png()
  .toBuffer();
layers.push({ input: player, left: 176, top: platform.y - 80 });

offset = 0;
while (offset < platform.width) {
  const cap = offset === 0 ? 0 : offset >= platform.width - tileWorld ? columns - 1 : 1 + (Math.max(0, middle++) % 10);
  const width = Math.min(tileWorld, platform.width - offset);
  await addTile(cap, 3, platform.x + offset, platform.y - 12, width, tileWorld);
  offset += width;
}

await sharp(backgroundPath)
  .resize(480, 270, { fit: "fill", kernel: sharp.kernel.nearest })
  .composite(layers)
  .resize(960, 540, { kernel: sharp.kernel.nearest })
  .png()
  .toFile(outputPath);

console.log(`Rendered ${path.relative(root, outputPath)}`);
