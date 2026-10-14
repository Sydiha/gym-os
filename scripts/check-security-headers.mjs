import { readFileSync, existsSync } from "node:fs";
import { strict as assert } from "node:assert";

const path = "dist/_headers";
assert.ok(existsSync(path), "Cloudflare Pages _headers must be copied to dist");
const text = readFileSync(path, "utf8");
const required = [
  "X-Content-Type-Options: nosniff",
  "Referrer-Policy: strict-origin-when-cross-origin",
  "X-Frame-Options: DENY",
  "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()",
  "Strict-Transport-Security: max-age=31536000",
  "/version.json",
  "Cache-Control: no-store",
];
for (const entry of required) assert.ok(text.includes(entry), `Missing security header configuration: ${entry}`);
console.log("Cloudflare Pages baseline security headers present in dist.");
