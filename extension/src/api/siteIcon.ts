/**
 * Discovers a site's real icons by reading the page's `<link rel="icon">`
 * tags ("directly from the link"). This is the only reliable source for
 * self-hosted apps: aggregators don't know them, and the Google service
 * answers with a generic 16px globe on miss.
 *
 * Requires `host_permissions: ["<all_urls>"]` so page HTML can be fetched
 * from the newtab page. Without the permission (or on fetch failure) this
 * resolves to `[]` and the static waterfall in `favicon.ts` applies.
 */

const APPLE_TOUCH_BONUS = 150_000;
const CLASSIC_ICO_SIZE = 16;
const FETCH_TIMEOUT_MS = 4000;
const MAX_ICON_LINKS = 4;
const SCORE_ANY_SIZE = 100_000;
const SCORE_SVG = 200_000;
const SCORE_UNKNOWN_RASTER = 1000;
const SIZE_MATCH_INDEX = 1;
const SIZE_MATCH_SECOND = 2;

const cache = new Map<string, Promise<string[]>>(),
  scoreHref = (icon: { rel: string; type: string; href: string; sizes: string }): number => {
    const { rel, type, sizes } = icon,
      lowerHref = icon.href.toLowerCase();
    // Vector scales infinitely – best possible source.
    if (type.includes('svg') || lowerHref.endsWith('.svg')) {
      return SCORE_SVG;
    }
    if (sizes.trim().toLowerCase() === 'any') {
      return SCORE_ANY_SIZE;
    }
    const match = /(\d+)\s*x\s*(\d+)/i.exec(sizes),
      dimension = match
        ? Math.max(Number(match[SIZE_MATCH_INDEX]), Number(match[SIZE_MATCH_SECOND]))
        : 0;
    if (rel.includes('apple-touch-icon')) {
      return APPLE_TOUCH_BONUS + dimension;
    }
    if (dimension > 0) {
      return dimension;
    }
    if (lowerHref.endsWith('.ico')) {
      return CLASSIC_ICO_SIZE;
    }
    return SCORE_UNKNOWN_RASTER;
  },
  /**
   * Extracts absolute icon URLs from page HTML, best-first (max 4).
   * Skips `mask-icon` (monochrome Safari pinned-tab glyph, useless as a tile).
   */
  parseIconLinks = (html: string, baseUrl: string): string[] => {
    const scored: { url: string; score: number }[] = [],
      tags = html.match(/<link\b[^>]*>/gi) ?? [];
    for (const tag of tags) {
      const rel = (/\brel\s*=\s*["']?([^"'\s>]+)/i.exec(tag)?.[1] ?? '').toLowerCase();
      if (!rel.includes('icon') || rel.includes('mask-icon')) {
        continue;
      }
      const href = /\bhref\s*=\s*["']([^"']+)/i.exec(tag)?.[1];
      if (!href) {
        continue;
      }
      let url: string;
      try {
        const parsed = new URL(href, baseUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          continue;
        }
        url = parsed.href;
      } catch {
        continue;
      }
      const type = (/\btype\s*=\s*["']?([^"'\s>]+)/i.exec(tag)?.[1] ?? '').toLowerCase(),
        sizes = /\bsizes\s*=\s*["']?([^"'\s>]+)/i.exec(tag)?.[1] ?? '';
      scored.push({ score: scoreHref({ href, rel, sizes, type }), url });
    }
    const seen = new Set<string>();
    return scored
      .toSorted((left, right) => right.score - left.score)
      .map((entry) => entry.url)
      .filter((url) => (seen.has(url) ? false : (seen.add(url), true)))
      .slice(0, MAX_ICON_LINKS);
  },
  /** Fetches page HTML and returns discovered icon URLs (cached per origin). */
  fetchSiteIcons = async (link: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<string[]> => {
    let origin: string;
    try {
      origin = new URL(link).origin;
    } catch {
      return [];
    }
    const cached = cache.get(origin);
    if (cached) {
      return cached;
    }
    const controller = new AbortController(),
      timer = setTimeout(() => {
        controller.abort();
      }, timeoutMs),
      pending = fetch(link, { redirect: 'follow', signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) {
            return [];
          }
          const contentType = response.headers.get('content-type') ?? '';
          if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
            return [];
          }
          return parseIconLinks(await response.text(), response.url || link);
        })
        .catch(() => [])
        .finally(() => {
          clearTimeout(timer);
        });
    cache.set(origin, pending);
    return pending;
  };

export { fetchSiteIcons, parseIconLinks };
