// Generate OS SYLVAR icons only from the approved, unmodified master artwork.
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const dir = new URL('../public/icons/', import.meta.url);
const master = new URL('approved-logo-source.png', dir);
const source = await readFile(master).catch((error) => {
  throw new Error(`Missing or unreadable approved logo at public/icons/approved-logo-source.png: ${error.message}`);
});
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
if (!source.subarray(0, 8).equals(signature)) throw new Error('Approved logo must be a genuine PNG file.');
let metadata;
try { metadata = await sharp(source, { failOn: 'error' }).metadata(); }
catch (error) { throw new Error(`Approved logo is invalid or unreadable: ${error.message}`); }
if (metadata.format !== 'png' || metadata.width !== 1536 || metadata.height !== 1536 ||
    ![3, 4].includes(metadata.channels)) {
  throw new Error('Approved logo must be a 1536×1536 RGB/RGBA PNG.');
}

const outputs = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
];
for (const [name, size] of outputs) {
  const data = await sharp(source).resize(size, size, { fit: 'fill', kernel: 'lanczos3' }).png().toBuffer();
  await writeFile(new URL(name, dir), data);
}
// The complete source image remains within the central 80% maskable safe area.
const center = 409;
const inset = await sharp(source).resize(center, center, { kernel: 'lanczos3' }).png().toBuffer();
const maskable = await sharp({ create: { width: 512, height: 512, channels: 3, background: '#101211' } })
  .composite([{ input: inset, left: Math.floor((512 - center) / 2), top: Math.floor((512 - center) / 2) }])
  .png().toBuffer();
await writeFile(new URL('maskable-512.png', dir), maskable);

// Favicon is an SVG wrapper containing embedded PNG artwork; not vectorized artwork.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1536 1536" width="1536" height="1536"><image x="0" y="0" width="1536" height="1536" href="data:image/png;base64,${source.toString('base64')}" /></svg>\n`;
await writeFile(new URL('gym.svg', dir), svg);

for (const [name, size] of [...outputs, ['maskable-512.png', 512]]) {
  const data = await readFile(new URL(name, dir));
  const info = await sharp(data, { failOn: 'error' }).metadata();
  if (!data.subarray(0, 8).equals(signature) || info.format !== 'png' || info.width !== size || info.height !== size)
    throw new Error(`Generated icon failed validation: ${name}`);
}
if (!svg.includes('data:image/png;base64,')) throw new Error('Favicon generation failed.');
