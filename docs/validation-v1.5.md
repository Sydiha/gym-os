# V1.5 migration verification — 2026-10-11

## Baseline and scope

Read-only inspection confirmed `main` at approved V1.4 commit `4133a05ad6621697a5d2b2d9527575ab7ccc3834` before implementation on `feat/v1.5-dashboard-migration`. Both supplied reference attachments were available. The ZIP contains a directory named `gym-os-dashboard-v1.1`, but its final QA and README identify V1.2. The pasted migration request governs scope; historical attachment QA results are not counted as current test results.

Migrated Dashboard (calories, water, daily timeline, optional Plan B, gym-later, weekly journey), Nutrition (macros, meal log, favorites, estimated restaurant examples), Activity (walking/running/cycling and past records), Progress (record-derived activity/nutrition/weight and empty states), navigation, quick-add, settings, and all supporting dialogs.

Smallest approach: reuse V1.2 CSS and local SVG paths; translate markup into React feature components; extract typed records, pure calculations, demo fixtures, context state, and the localStorage adapter. No new dependency or production data model. V1.4 manifest, installation assets, service-worker configuration and explicit update behavior remain intact.

## Executed checks

Environment: Node 24.19.0, npm 11.9.0, Linux system Chromium 154.0.8037.57. Dependency versions remain locked to the V1.4 stack. Commands ran locally with network permission for installation and localhost browser servers.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm test` | 17 passed, 2 test files |
| `npm run build` | Passed; production PWA generated, 10 precache entries, approximately 270.5 KiB |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:smoke` | 16 passed |
| `git diff --check` | Passed |

Unit coverage: demo totals, local-day/rolling-week boundaries, planned and unplanned Plan B timing, rest/disabled/declined/already-active conditions, 5/10/15 movement generation, combined knee/shoulder alternatives, unique skipped movements, latest weight, persistence validation/storage failure, connectivity, cache readiness, explicit update action, and service-worker registration failure.

Browser coverage:

- All four screens and navigation; meal 500 kcal changes 1,420→1,920 and macros 55/150/48→85/200/68; estimated restaurant example gives 2,480; repeating a favorite gives 2,980. Water 3→4, weight 99.4, and records persist after reload.
- Walking 20 minutes, running 15, and past cycling 40 minutes/9.5 km produce 147 weekly minutes and five distinct days; activity today suppresses Plan B.
- Plan B hidden at 18:00 and visible at 18:01 for the planned 18:00 time, hidden before 20:00 without a plan (threshold also unit-tested), rest/disable/decline suppression, and combined limitation substitutions. 5/10/15 selections show 5/10/15 movements.
- Start, skip and back do not record. Skipping the same movement again does not double-deduct. Final confirmation records four minutes, weekly 72→76, and survives reload. Skipping all movements disables confirmation; exit records nothing.
- Reset empties records and shows empty states across screens, persists after reload, and restoration returns the sample totals.
- 375×812, 390×844, 430×932: screen navigation, measured visible button/summary/check-label targets ≥44px, no horizontal overflow, screenshots, dialog focus entry, Tab/Shift+Tab wrap, Escape, quick-add nested dialog focus restoration, profile level changes, background inertness and scroll locking, long 15-movement dialog scrolling, and opener restoration.
- Additional shell widths 320 and 1280; skip link, no page errors or external page requests in viewport checks; manifest and real icon dimensions; emulated reduced motion and no-JavaScript fallback.
- Real production service worker activation/control, offline reload with CSS/SVG intact, water modification persisted offline, all-screen navigation while offline, offline navigation fallback for an unvisited path, and reconnection status.

Two first-run test assumptions were corrected: Playwright `selectOption` does not itself focus the settings select, and the profile select needed its accessible-role/name selector. The affected checks and then the full suite were rerun. Initial dependency installation needed a writable workspace npm cache. No unexecuted acceptance check is represented as passing.

## Visual comparison

The supplied QA screenshots were used to review the approved hierarchy, typography, warm orange palette, local icons and Arabic RTL. They include a desktop iframe frame/scrollbar and different system-font rendering, so direct whole-image pixel equality is not a meaningful criterion.

Additionally, the unchanged supplied prototype and production React app were rendered in the same Chromium at all three requested mobile sizes, with the clock fixed to 2026-10-10 10:00 UTC, fresh demo state, reduced motion, and matching navigation. Plan B was opened after setting demo time to 21:00. Compared five states at each size (15 paired captures). Below, **left is V1.2, right is V1.5** at 390×844:

- [Dashboard](qa/v1.5/home-comparison.png)
- [Nutrition](qa/v1.5/nutrition-comparison.png)
- [Activity](qa/v1.5/activity-comparison.png)
- [Progress](qa/v1.5/progress-comparison.png)
- [Plan B](qa/v1.5/plan-comparison.png)

[Measured comparison data](qa/v1.5/comparison.json) includes screen geometry and changed-pixel percentages (a pixel counts only when any RGB channel differs by more than 16/255; this is diagnostic evidence, not a blanket visual pass threshold).

- Dashboard, Nutrition and Progress initial viewports: 0% over that threshold at all three sizes.
- Activity: 0.003–0.107%; selected headings/stat/navigation bounds match. Small inline-text differences and the retained PWA footer near the bottom account for visible differences.
- Plan B sheet bounds match at each size. Whole viewport differences 0.426–3.652% include a different background scroll position beneath the translucent overlay. The sheet interior comparison, excluding the rounded upper edge, differs by 0.056–0.078%. Movement content, dose descriptions, safety copy and controls remain present. No exact pixel-identity claim is made.

## Deliberate differences and limits

- Retained V1.4 connectivity/offline/update status appears after screen content; it increases full-page height compared with the prototype. The keyboard skip link and `aria-current` navigation semantics are retained/added without changing normal screen hierarchy.
- React preserves form/setting nodes across state updates. Dialog transitions focus the close button; closing restores the actual original opener, falling back to main if it no longer exists (for example, after recording Plan B). Background inertness, scroll locking and long-dialog scrolling remain supported.
- Storage validates record shapes before using the existing V1.2 demo key and falls back to demo fixtures for malformed data. Storage failure leaves the in-memory demo usable and reports failed saves. This is not V1.6 validation/migration or a production data store.
- Demo clock starts at browser time and is manually adjustable, matching V1.2; it is not a live scheduler. Weather is illustrative, restaurant data are estimates, and home-session minutes are self-confirmed, not measured. Existing V1.2 day-based demo water behavior is retained.
- No physical iPhone/Android, Safari/iOS, native installation, complete WCAG audit, low-end performance, storage-pressure/cache-eviction test, real two-build update lifecycle or multi-tab synchronization test. Explicit update action is unit-tested; production offline reload is browser-tested.
- Nothing deployed or merged. Remote CI status is reported separately on the PR for its exact HEAD; local results are not CI results.
