import { describe, expect, it } from 'bun:test';
import {
  averageThumbRegion,
  coverSourceRect,
  resolveBackgroundSource,
} from './wallpaperSampler.js';
import type { Thumb } from './wallpaperSampler.js';

describe('wallpaperSampler - resolveBackgroundSource', () => {
  it('prefers the active image over static', () => {
    const src = resolveBackgroundSource({
      active: true,
      image: { author: '', next: '', origin: '', profile: '', src: 'active.jpg' },
      static: 'static.jpg',
    } as never);
    expect(src).toEqual({ kind: 'image', src: 'active.jpg' });
  });

  it('falls back to static when inactive, then to the image src', () => {
    expect(
      resolveBackgroundSource({
        active: false,
        image: { author: '', next: '', origin: '', profile: '', src: 'img.jpg' },
        static: 'static.jpg',
      } as never),
    ).toEqual({ kind: 'image', src: 'static.jpg' });

    expect(
      resolveBackgroundSource({
        active: false,
        image: { author: '', next: '', origin: '', profile: '', src: 'img.jpg' },
      } as never),
    ).toEqual({ kind: 'image', src: 'img.jpg' });
  });

  it('falls back to color and none', () => {
    expect(resolveBackgroundSource({ color: '#abc' } as never)).toEqual({
      color: '#abc',
      kind: 'color',
    });
    expect(resolveBackgroundSource()).toEqual({ kind: 'none' });
  });
});

describe('wallpaperSampler - coverSourceRect', () => {
  it('maps 1:1 when image and viewport match', () => {
    const r = coverSourceRect(
      { h: 100, w: 200 },
      { h: 100, w: 200 },
      { h: 30, w: 50, x: 10, y: 20 },
    );
    expect(r.sx).toBeCloseTo(10);
    expect(r.sy).toBeCloseTo(20);
    expect(r.sw).toBeCloseTo(50);
    expect(r.sh).toBeCloseTo(30);
  });

  it('centers the crop when the image is scaled to cover', () => {
    // 100x100 image on a 200x100 viewport: scale 2, displayed 200x200,
    // Vertically centered with -50px offset. Full viewport maps to full image.
    const r = coverSourceRect(
      { h: 100, w: 100 },
      { h: 100, w: 200 },
      { h: 100, w: 200, x: 0, y: 0 },
    );
    expect(r.sx).toBeCloseTo(0);
    expect(r.sy).toBeCloseTo(25);
    expect(r.sw).toBeCloseTo(100);
    expect(r.sh).toBeCloseTo(50);
  });

  it('clamps rects extending outside the viewport', () => {
    const r = coverSourceRect(
      { h: 200, w: 200 },
      { h: 200, w: 200 },
      { h: 100, w: 100, x: -50, y: -50 },
    );
    expect(r.sx).toBeCloseTo(0);
    expect(r.sy).toBeCloseTo(0);
    expect(r.sw).toBeCloseTo(50);
    expect(r.sh).toBeCloseTo(50);
  });
});

describe('wallpaperSampler - averageThumbRegion', () => {
  const thumb: Thumb = {
    // 2x2: red, green / blue, white
    data: new Uint8ClampedArray([
      255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255,
    ]),
    w: 2,
    h: 2,
    naturalW: 200,
    naturalH: 200,
  };

  it('averages the full image', () => {
    const avg = averageThumbRegion(thumb, { sh: 200, sw: 200, sx: 0, sy: 0 });
    expect(avg).toEqual({ b: 128, g: 128, r: 128 });
  });

  it('averages a sub-region (top-left quadrant = red)', () => {
    const avg = averageThumbRegion(thumb, { sh: 100, sw: 100, sx: 0, sy: 0 });
    expect(avg).toEqual({ b: 0, g: 0, r: 255 });
  });

  it('returns null for empty regions', () => {
    expect(averageThumbRegion(thumb, { sh: 100, sw: 0, sx: 0, sy: 0 })).toBeNull();
  });
});
