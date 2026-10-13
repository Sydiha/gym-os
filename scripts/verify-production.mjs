const origin = process.env.GYM_OS_PRODUCTION_URL ?? "https://gym-os-7rg.pages.dev";
const paths = [
  "/",
  "/exercises/reviewed/gym-leg-curl-main.webp",
  "/exercises/reviewed/gym-leg-curl-correct.webp",
  "/exercises/reviewed/gym-leg-curl-mistake-hips.webp",
  "/exercises/reviewed/gym-leg-curl-mistake-back-arch.webp",
];
let failures = 0;
for (const path of paths) {
  const url = new URL(path, origin);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { "Cache-Control": "no-cache" } });
    const bytes = new Uint8Array(await response.arrayBuffer());
    const html = path === "/";
    const correctSignature = html
      ? new TextDecoder().decode(bytes).includes("<html")
      : bytes.length >= 16 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
        new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
    const ok = response.ok && correctSignature;
    console.log(`${ok ? "PASS" : "FAIL"} ${url} HTTP ${response.status}, ${bytes.length} bytes`);
    if (!ok) failures++;
  } catch (error) {
    failures++;
    console.error(`FAIL ${url}: ${error.message}`);
  }
}
if (failures) {
  console.error(`Production verification failed for ${failures} of ${paths.length} paths.`);
  process.exitCode = 1;
}
