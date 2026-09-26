import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const manifestPath = process.argv[2];
if (!manifestPath)
  throw new Error('Usage: assemble-gif.mjs manifest.json [sharp-module-path]');
const directory = path.dirname(path.resolve(manifestPath));
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
let sharpPath = process.argv[3];
if (!sharpPath) {
  const require = createRequire(path.join(process.cwd(), 'package.json'));
  const nextRequire = createRequire(
    require.resolve('next/package.json', {
      paths: [path.join(process.cwd(), 'client')]
    })
  );
  sharpPath = nextRequire.resolve('sharp');
}
const { default: sharp } = await import(
  pathToFileURL(path.resolve(sharpPath)).href
);
const width = manifest.width ?? 520;
const height = manifest.height ?? 820;
const output = path.resolve(directory, manifest.output);
if (!Array.isArray(manifest.scenes) || !manifest.scenes.length)
  throw new Error('At least one scene is required');
const escape = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;');
const frames = [];
await fs.mkdir(path.dirname(output), { recursive: true });
for (const [index, scene] of manifest.scenes.entries()) {
  let source = sharp(path.resolve(directory, scene.input));
  if (scene.crop) source = source.extract(scene.crop);
  const cropped = await source.png().toBuffer();
  await fs.writeFile(`${output}.scene-${index + 1}.png`, cropped);
  const resized = await sharp(cropped)
    .resize(width - 60, height - 160, { fit: 'inside' })
    .png()
    .toBuffer();
  const metadata = await sharp(resized).metadata();
  const frame = await sharp({
    create: { width, height, channels: 4, background: '#f5f7fb' }
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><text x="30" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#1c2736">${escape(scene.title)}</text><text x="30" y="74" font-family="Arial, sans-serif" font-size="14" fill="#5b6677">${escape(scene.caption)}</text></svg>`
        ),
        top: 0,
        left: 0
      },
      {
        input: resized,
        top: 105 + Math.round((height - 160 - metadata.height) / 2),
        left: Math.round((width - metadata.width) / 2)
      }
    ])
    .raw()
    .toBuffer();
  frames.push(frame);
}
await sharp(Buffer.concat(frames), {
  raw: {
    width,
    height: height * frames.length,
    channels: 4,
    pageHeight: height
  }
})
  .gif({ delay: manifest.scenes.map((scene) => scene.delay ?? 2600), loop: 0 })
  .toFile(output);
console.log(output);
