# Approved V1.2 reference

Read-only inspection of both user attachments preceded implementation. The ZIP's internal directory is `gym-os-dashboard-v1.1/`, but its README and final QA identify the approved revision as V1.2. The standalone QA report and mobile home screenshot were also inspected.

| Attachment | SHA-256 |
| --- | --- |
| GYM-OS-Dashboard-V1.2-QA-Final.zip | `3d7527d0c66dded6519381571ea85b7d98c70abdae29b7a85e6b31f09e482ced` |
| GYM-OS-V1.2-Final-UX-UI-QA.md | `2ed1a3f83a3e19137e83e8aa09b4cdfa39fed034441f91e0fbcf24686193adb8` |

## Token provenance

`src/tokens.css` extracts values directly from the prototype's `index.html`:

- `:root`: system font stack, text `#f8f4f4`, background `#151219`.
- Theme meta: `#17131b`.
- `.shell`: 480px maximum width, 26px / 22px top / inline padding, original radial gradient.
- `.brand span`, `.accent`, `.underline`: `#f7ab74`, `#f4a36e`, `#f6a36d`.
- `.muted`: `#aaa4b6` (also used for small secondary copy).
- `:focus-visible`: `#ffb47c`.
- `.weather`: surface `#211c25`, border `#3a3340`, 12px radius.
- `.icon`: `#2c2732`, `#f3ab76`.
- `.wide`: original orange gradient, foreground `#291d1b`, 40px radius, shadow and 51px minimum height.
- V1.2 QA overrides: 44px minimum interactive targets and reduced-motion rules.

`public/icons/gym.svg` reuses the exact `gym` SVG path from the prototype's `app.js`. Installation icons wrap that same path in the approved background and icon colors. Run `node scripts/generate-icons.mjs` to regenerate the PNGs; their foreground stays within the maskable safe zone. There were no standalone font or logo files in the archive, so none are invented or remotely loaded.

The heading, wordmark treatment, and tagline are retained. The welcome and connection messages are foundation-only copy. The full dashboard, bottom navigation, calorie values, demo records, and feature interactions are intentionally deferred under the user's V1.4 scope. The QA document is reference evidence, not an instruction to implement its feature list. Its historical test results are not represented as V1.4 results.
