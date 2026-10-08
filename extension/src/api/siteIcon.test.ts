import { describe, expect, it } from 'bun:test';
import { fetchSiteIcons, parseIconLinks } from './siteIcon.js';

const NEST_HTML = `<!doctype html><html><head>
<title>Nest</title>
<link rel="icon" type="image/svg+xml" href="/logo.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="stylesheet" crossorigin href="/assets/index-Du-Tcis6.css">
</head></html>`;

describe('parseIconLinks', () => {
  it('finds the page-declared icon and resolves it absolutely', () => {
    expect(parseIconLinks(NEST_HTML, 'https://nest.w4y.io/')).toEqual([
      'https://nest.w4y.io/logo.svg',
    ]);
  });

  it('prefers vector, then largest raster, skips mask-icon', () => {
    const html = `<head>
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/f32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/a180.png" />
      <link rel="mask-icon" href="/safari.svg" color="black" />
      <link rel="icon" type="image/svg+xml" href="/logo.svg" />
    </head>`;
    expect(parseIconLinks(html, 'https://example.com/page')).toEqual([
      'https://example.com/logo.svg',
      'https://example.com/a180.png',
      'https://example.com/f32.png',
      'https://example.com/favicon.ico',
    ]);
  });

  it('returns [] when nothing usable is declared', () => {
    expect(parseIconLinks('<html><head></head></html>', 'https://example.com')).toEqual([]);
  });
});

describe('fetchSiteIcons', () => {
  it('returns [] for unparseable links without throwing', async () => {
    const icons = await fetchSiteIcons('not a url');
    expect(icons).toEqual([]);
  });
});
