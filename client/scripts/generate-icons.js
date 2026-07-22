import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../public/favicon.svg');
const outDir = path.join(__dirname, '../public');

if (!fs.existsSync(svgPath)) {
  console.error("favicon.svg not found in public folder!");
  process.exit(1);
}

const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512];

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate apple-touch-icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toFile(path.join(outDir, 'apple-touch-icon.png'));

  for (const size of sizes) {
    // Generate standard icon
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`));
    
    // Generate maskable icon (padding + background)
    await sharp(svgBuffer)
      .resize(Math.floor(size * 0.8), Math.floor(size * 0.8)) // Add 20% safe zone padding
      .extend({
        top: Math.floor(size * 0.1),
        bottom: Math.floor(size * 0.1),
        left: Math.floor(size * 0.1),
        right: Math.floor(size * 0.1),
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(outDir, `maskable-icon-${size}.png`));
  }
  
  // favicon.ico 
  fs.copyFileSync(path.join(outDir, 'icon-32.png'), path.join(outDir, 'favicon.ico'));

  console.log("All icons generated successfully!");
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
