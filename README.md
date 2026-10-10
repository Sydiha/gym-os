# GYM OS — V1.4 PWA foundation

A minimal React + TypeScript + Vite shell preserving the approved V1.2 Arabic RTL Dark Premium identity. Reference provenance and extracted tokens are documented in [docs/reference.md](docs/reference.md).

## Local development

Requires Node.js 22.12+ (verified with Node 24).

```sh
npm ci
npm run dev
```

## Validation

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:smoke
```

If Chromium is already installed, use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:smoke` instead of downloading a browser. Smoke tests start a local Vite preview of the existing `dist/`; always build first. Test reports and build output are ignored by Git.

## PWA behavior

```sh
npm run build
npm run preview
```

Open the displayed localhost URL online once, wait for the offline-ready message, then disconnect and reload. The production build precaches the HTML shell, JavaScript, CSS, manifest, and local icons with Workbox. Navigation falls back to the shell, including a previously unvisited path. No runtime data or third-party resources are cached. Browser online/offline events describe browser connectivity; they do not probe an external service.

Service workers are disabled during `npm run dev`. They require HTTPS or localhost and cannot make a first-ever visit work offline. This foundation assumes hosting at `/` with SPA navigation fallback; subdirectory hosting needs coordinated Vite base, manifest scope/start URL, and asset path changes. Nothing is deployed by this repository's scripts.

The manifest supports standalone installation with Arabic language/direction, 192px and 512px icons, a maskable icon, and an Apple touch icon. Installation is managed by the browser; no custom install prompt is provided. New builds wait for the user to choose **تحديث الآن** before activating and reloading; normal service-worker registration checks for updates on app load. Registration failures leave the shell available with an explanatory status. Browser-controlled cache eviction can remove offline availability.

## Scope

V1.4 includes the responsive shell, design tokens, local icon assets, connectivity status, manifest, offline caching, update handling, unit tests, and production browser smoke tests. It has no meal/water/activity tracking, Plan B, account, application-data storage, backend, cloud database, paid service, or external analytics. There are no remotely hosted runtime fonts, scripts, or assets.

See [docs/validation.md](docs/validation.md) for actual verification results and remaining device checks.
