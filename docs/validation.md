# V1.4 verification — 2026-10-10

Executed locally in `/workspace/gym-os` on branch `feat/v1.4-pwa-foundation`, based on `origin/main` at `76aba7cfb0aa8402b4dfcd0d36089271bcb5f064`.

Environment: Node 24.19.0, npm 11.9.0, system Chromium 154.0.8037.57 on Linux. Package versions are locked in `package-lock.json`.

| Check | Actual result |
| --- | --- |
| `npm run typecheck` | Passed, no TypeScript errors |
| `npm run build` | Passed; Vite production bundle, manifest, generated service worker and Workbox runtime; 10 precache entries / 229.56 KiB |
| `npm test` | Passed: 5 unit tests |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:smoke` | Passed: 8 browser smoke tests |
| `git diff --check` | Passed |
| Visual inspection | Inspected approved V1.2 mobile screenshot plus resulting 390px mobile and 1280px desktop screenshots (the latter capture keyboard focus on main) |

Unit coverage: foundation-only content, browser connectivity changes, offline-ready messaging, explicit update action, and service-worker registration failure.

Browser coverage:

- Arabic `lang` and RTL direction, approved background color, expected heading, no horizontal overflow at widths 320, 375, 390, 430, and 1280px.
- Keyboard skip link and main focus, no page errors or third-party page requests in those viewport checks.
- Manifest identity/scope/language/display/colors; three icon responses, image types, and actual raster dimensions.
- Real production service-worker activation and first-page control; offline reload with CSS and SVG intact; offline fallback for a previously unvisited URL; restored connectivity status.
- Emulated reduced-motion preference and visible no-JavaScript fallback.

During validation, the initial PWA import was corrected to the plugin's virtual module and the unit-test resolver was configured. Browser testing caught missing first-page service-worker control; `clientsClaim` was enabled without enabling automatic update activation. A Playwright assertion was adjusted because its text matcher excludes `noscript` contents. All listed final checks passed after these corrections. The browser server needed the environment's network permission to bind localhost.

## Not verified

- Physical iPhone/Android installation, Safari/iOS, Firefox, or native standalone launch behavior.
- A real two-build upgrade and multiple open tabs. Update action is unit-tested; complete lifecycle testing remains pending.
- Cache eviction/storage pressure, low-end hardware, throttled networks, or comprehensive accessibility/performance auditing.
- Remote GitHub Actions execution at the time of this report. A CI workflow is included for the same checks; its result must be reviewed on the PR.

No deployment, merge, backend, database, analytics, or full application feature implementation was performed. Offline use requires a successful first online load and retained browser storage.
