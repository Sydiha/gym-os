import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const sourceRoot = 'public/exercises/reviewed';
const buildRoot = 'dist/exercises/reviewed';
const required = [
  'gym-leg-curl-main.webp',
  'gym-leg-curl-correct.webp',
  'gym-leg-curl-comparison.webp',
];

const mediaSource = await readFile('src/domain/reviewedExerciseMedia.ts', 'utf8');
const names = [...new Set(
  [...mediaSource.matchAll(/\/exercises\/reviewed\/([a-z0-9-]+\.webp)/g)].map(match => match[1]),
)].sort();
for (const name of required) {
  if (!names.includes(name)) throw new Error(`Missing required leg-curl image reference: ${name}`);
}
if (names.length === 0) throw new Error('No reviewed WebP exercise images are referenced.');

for (const name of names) {
  const sourcePath = join(sourceRoot, name);
  const outputPath = join(buildRoot, name);
  const source = await readFile(sourcePath).catch(() => {
    throw new Error(`Referenced exercise image is missing from source: ${sourcePath}`);
  });
  const output = await readFile(outputPath).catch(() => {
    throw new Error(`Built site is missing exercise image: ${outputPath}`);
  });
  if (source.length < 1000 || output.length < 1000) {
    throw new Error(`Exercise image is unexpectedly small: ${name}`);
  }
  if (source.toString('ascii', 0, 4) !== 'RIFF' || source.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error(`Invalid WebP signature: ${name}`);
  }
  const sourceMetadata = await sharp(source).metadata();
  const decoded = await sharp(source).rotate().toBuffer();
  if (sourceMetadata.format !== 'webp' || sourceMetadata.width < 256 || sourceMetadata.height < 256 || decoded.length === 0) {
    throw new Error(`WebP cannot be fully decoded at usable dimensions: ${name}`);
  }
  if (!source.equals(output)) {
    throw new Error(`Built asset differs from its source: ${name}`);
  }
  const hash = createHash('sha256').update(output).digest('hex');
  console.log(`Verified ${name}: ${sourceMetadata.width}x${sourceMetadata.height}, ${output.length} bytes, sha256 ${hash}`);
}
console.log(`Verified ${names.length} referenced WebP files in source and production build output.`);
