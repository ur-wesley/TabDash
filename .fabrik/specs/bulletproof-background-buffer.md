# Bulletproof Background Image Buffer & Caching System Spec

## Problem Statement

The wallpaper buffering mechanism in TabDash (`settingStore.ts`, `App.tsx`, and `settings.ts`) has critical flaws:

1. **Crash on Empty Buffer**: `cache[0].links` throws `TypeError: Cannot read properties of undefined` on cold start due to stale local variable binding.
2. **Buffer Wipeout**: Evicts and wipes out newly fetched images when cache has 1 element.
3. **Storage Quota Failure**: Storing raw Unsplash API objects (>25KB) inside settings causes `chrome.storage.sync` to fail (quota limit is 8KB).
4. **Dead Preloading**: `<img src={...} class="hidden" loading="lazy" />` is ignored by browser engines.
5. **UI Flicker**: Direct imperative DOM updates (`document.querySelector`) cause white flashes.

## Proposed Solution

1. Extract a dedicated `imageBuffer.ts` module with minimal sanitized schema (`CachedImage`).
2. Store buffer strictly in `chrome.storage.local` under `tabdash_image_buffer`, decoupling it from synced settings.
3. Asynchronous Producer-Consumer architecture: Pop head immediately (0ms latency), replenish tail in background if length < 2.
4. Concurrency lock to deduplicate simultaneous requests across multiple tabs.
5. Non-blocking fire-and-forget Unsplash download tracking.
6. Declarative dual-layer crossfade rendering in SolidJS for seamless transitions.
7. Unit tests in `imageBuffer.test.ts`.

## Verification

- `bun test`
- `bun run check`
- `bun run --filter @ur-wesley/tabdash-extension build`
