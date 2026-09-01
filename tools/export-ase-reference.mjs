import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { Aseprite } from "@pixelation/aseprite";
import sharp from "sharp";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node tools/export-ase-reference.mjs <input.ase> <output.png>");
  process.exit(1);
}

const source = fs.readFileSync(inputPath);
const sourceBuffer = source.buffer.slice(
  source.byteOffset,
  source.byteOffset + source.byteLength,
);
const sprite = new Aseprite(sourceBuffer);
const frame = sprite.frames[0];

if (!frame) {
  throw new Error(`No frame found in ${inputPath}`);
}

const canvas = Buffer.alloc(sprite.width * sprite.height * 4);

function blendPixel(targetIndex, sourcePixel, opacity) {
  const sourceAlpha = (sourcePixel[3] / 255) * opacity;
  const targetAlpha = canvas[targetIndex + 3] / 255;
  const outputAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);

  if (outputAlpha === 0) return;

  for (let channel = 0; channel < 3; channel += 1) {
    canvas[targetIndex + channel] = Math.round(
      (sourcePixel[channel] * sourceAlpha +
        canvas[targetIndex + channel] * targetAlpha * (1 - sourceAlpha)) /
        outputAlpha,
    );
  }

  canvas[targetIndex + 3] = Math.round(outputAlpha * 255);
}

for (const layer of frame.layers) {
  if (!layer.visible) continue;

  for (const cel of layer.cels) {
    const opacity = (layer.opacity / 255) * (cel.opacity / 255);

    for (let y = 0; y < cel.height; y += 1) {
      for (let x = 0; x < cel.width; x += 1) {
        const sourcePixel = cel.pixels[y * cel.width + x];
        const targetX = cel.x + x;
        const targetY = cel.y + y;

        if (
          (!Array.isArray(sourcePixel) && !ArrayBuffer.isView(sourcePixel)) ||
          targetX < 0 ||
          targetX >= sprite.width ||
          targetY < 0 ||
          targetY >= sprite.height
        ) {
          continue;
        }

        blendPixel((targetY * sprite.width + targetX) * 4, sourcePixel, opacity);
      }
    }
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
await sharp(canvas, {
  raw: { width: sprite.width, height: sprite.height, channels: 4 },
})
  .png()
  .toFile(outputPath);

console.log(`Exported ${inputPath} -> ${outputPath} (${sprite.width}x${sprite.height})`);
