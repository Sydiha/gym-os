# V1.6.1 free hosting and iPhone pilot readiness

## Baseline and production audit

The approved baseline is `248ce8805d76bc410d2414f8a0308b7f0ace187a` on `feat/v1.6.1-iphone-pilot`. The working tree was clean before this documentation change.

The Vite build is rooted at `/`: the document, icon, manifest, and service-worker URLs use root paths, and the manifest scope/start URL are `/`. Host the generated `dist/` contents at the domain root with SPA navigation fallback; a subpath deployment would need coordinated path changes. The current `vite-plugin-pwa` build generates a prompt-based service worker, precaches the app shell and local assets, claims clients, falls back to `index.html` for navigation, and has no runtime caching. Inspection of the generated worker confirmed the manifest and all four PNG icons are precached. The service worker is disabled in Vite development mode. No configuration change was needed for a root-hosted HTTPS pilot.

The production build contains HTML, CSS, JavaScript, local SVG/PNG icons, the web manifest, and service-worker files. It contains the app's synthetic demo fixture, including `seed-meal`; that is sample data, not a real person's record. The build scan found no `.json` backup or sensitive-named files and no matches for common credential formats in bundled JavaScript. The tracked-file scan found no checked-in `.env`, JSON backup, or common credential-pattern match. These pattern scans are a practical check, not a guarantee against every possible secret format. Personal records are stored in device-local IndexedDB and are not part of the static bundle or sent to an app backend; exported backup files are user-managed plaintext JSON and must be protected separately.

## Hosting recommendation

Recommend **Cloudflare Pages Free**, connected to the private GitHub repository, using the static site flow. Cloudflare's [Git integration documentation](https://developers.cloudflare.com/pages/get-started/git-integration/) states that both private and public GitHub repositories are supported. Configure the repository root as the root directory, `npm run build` as the build command, and `dist` as the output directory. Use `/` at the site root; no custom domain or DNS change is required for a `pages.dev` pilot. This recommendation is for a future owner-approved setup only: no Cloudflare account, project, or deployment has been created.

According to Cloudflare's [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) checked 2026-10-11, the Free plan allows 1 build at a time, 500 builds per month, a 20-minute build timeout, up to 20,000 files per site, and a maximum 25 MiB per site asset. These terms and the Free plan may change. The limits page does not state that a credit card is required for Pages Free, but it also does not guarantee cardless account onboarding. No paid plan or subscription is needed for this static-site recommendation; if signup or setup requests payment details or an upgrade, stop and ask the owner rather than entering billing information.

## Manual iPhone Safari acceptance checklist

Run only after the owner approves hosting and a build is available over HTTPS. Use a normal Safari browsing session, not Private Browsing. Record the iPhone model and iOS version with the pilot results.

- [ ] Open the site at its final HTTPS `pages.dev` URL in Safari; confirm there is no certificate warning and the Arabic RTL Dark Premium interface renders correctly.
- [ ] In Safari's Share menu, choose **Add to Home Screen**; launch the new icon and confirm the app opens in standalone display with the expected name and icon.
- [ ] In Personal mode, add a harmless test record, close the installed app fully, reopen it, and verify the record and settings remain.
- [ ] Wait for the app to report offline readiness. Enable Airplane Mode, close and reopen the installed app, navigate between sections, add or edit a harmless Personal record, reload, and verify the local change remains.
- [ ] With a known Personal record saved, switch to Demo and verify its sample records are distinct. Change or reset Demo data, return to Personal, and confirm Personal records were not changed. Repeat in the other direction if useful.
- [ ] Export a Personal JSON backup to Files. Confirm the expected filename and that the backup is stored somewhere separate from the browser's site data. Restore it after a reversible test change and verify the expected records return.
- [ ] Try restoring an invalid or unsupported JSON file and confirm it is rejected without replacing the existing Personal data.
- [ ] Review storage risks with the pilot user: records are local to this browser/device, are not cloud-synced, and may be lost if site data is cleared, the app/browser is removed, the device is lost, or browser storage is evicted. Storage quotas and eviction behavior are browser/OS-controlled and not guaranteed; keep a current backup outside the app.
- [ ] While online, install a later approved build and reopen the app. Confirm the update notice appears, **تحديث الآن** activates the update, and the new version loads. Also verify that the previous cached version remains usable offline until an update can be downloaded.

Do not enter real sensitive data during initial acceptance. Use disposable test records and remove them after the pilot checks.
