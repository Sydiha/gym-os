// Reuses the exact V1.2 dumbbell path; no new logo artwork.
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
const source = await readFile(new URL('../public/icons/gym.svg', import.meta.url), 'utf8');
const path = source.match(/<path[^>]+\/>/)[0];
// All foreground geometry stays inside the maskable icon's central safe zone.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#151219"/><g transform="translate(128 128) scale(10.6666667)" fill="none" stroke="#f3ab76" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</g></svg>`;
for (const [name, size] of [['icon-192', 192], ['icon-512', 512], ['maskable-512', 512], ['apple-touch-icon', 180]]) {
  await sharp(Buffer.from(icon)).resize(size, size).png().toFile(new URL(`../public/icons/${name}.png`, import.meta.url).pathname);
}
