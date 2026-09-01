# V11 QA Checklist

## Static integrity — PASS

- Exactly one `h1`
- Exactly one `main` landmark
- Primary navigation is labeled
- Duplicate IDs: none
- Broken internal anchors: none
- Missing referenced local assets: none
- Booking CTA service values missing from booking select: none
- Images missing `alt`: none
- Buttons missing explicit `type`: none
- CSS parser errors: none
- JavaScript syntax (`node --check`): pass
- `noscript` contact fallback: present
- IIS `web.config`: present

## Interaction fixes in V11

- Global long-distance `scroll-behavior: smooth` removed.
- Internal anchors use smart navigation: short nearby movement may be smooth, long movement is immediate.
- Reveal animation no longer changes opacity, so content cannot appear dim/blank during fast scrolling, screenshots or anchor navigation.
- Reading-progress indicator uses only `transform` and does not affect layout.
- Reduced-motion users receive no content reveal or decorative system pulse animation.
- Booking fallback scroll is immediate on browsers without native dialog support.
- Existing mobile menu inert/focus behavior and booking dialog focus restoration are retained.

## Responsive baseline retained

The layout retains the previous hardened responsive rules for:

- 320 / 360 / 375 / 390 / 430 phones
- 640 / 768 / 900 tablets
- 1024 / 1080 / 1180 compact desktop/tablet landscape
- 1366 / 1440 / 1600 / 1920 desktop

The V11 edits do not introduce new width-bearing layout containers; the only new visual element is a 2px fixed-header progress line contained inside the header.

## Production checks still required after deployment

- Test the final public URL on real iPhone/Safari and Android/Chrome.
- Verify the chosen live scheduler URLs.
- Complete one real free booking end-to-end.
- Complete one low-value paid test booking/refund in the selected payment provider.
- Verify Formspree fallback delivery.
- Verify IIS HTTPS binding/redirect, compression, cache policy and server logs.
- Run Lighthouse against the deployed HTTPS site.
