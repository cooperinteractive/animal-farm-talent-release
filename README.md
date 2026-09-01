# Animal Farm Talent Release (v2, offline-ready)

iPad kiosk web app for collecting signed talent/media releases at events. Fork of shannonkapp/animal-farm-talent-release with offline and reliability upgrades.

## What changed in v2

- Fully self-contained `index.html`: Tailwind CSS is precompiled and inlined, jsPDF and signature_pad are inlined. No CDN requests, no Google Fonts. The app loads with zero internet once cached.
- `sw.js` service worker: caches the app shell, serves it instantly from cache, refreshes in the background when online.
- Requests persistent storage (`navigator.storage.persist()`) so iOS is far less likely to evict saved releases.
- Photos are downscaled to 1280px JPEG before storing (PDFs went from multiple MB to ~25KB each).
- Signature is flattened to black-ink-on-white JPEG in the PDF (smaller and looks like a signed paper document).
- Signature canvas no longer wipes itself when the layout reports a zero size (backgrounding, rotation).
- Queue drawer has "Share All Pending" (one share sheet with every pending PDF) and "Save All to Files".
- PDF now records the signed time and app version alongside the date.
- If saving to the queue ever fails, the PDF still downloads and the user is warned.

## Deploying

Serve the repo root over HTTPS (GitHub Pages works as is). `index.html` and `sw.js` must live in the same directory.

## Editing

Do not edit `index.html` directly; it is generated. Edit `build/index.src.html`, then run:

```
node build/build.js
```

When you deploy a change, bump `CACHE_VERSION` in `sw.js` so installed iPads pick it up.

## iPad setup (do this once, on Wi-Fi)

1. Open the site in Safari.
2. Share button, then "Add to Home Screen".
3. Launch it from the home screen icon once while still online.
4. Run one test release end to end, then delete it from the queue.
After that it works with no signal.
