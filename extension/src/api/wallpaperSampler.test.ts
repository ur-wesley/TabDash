import { describe, expect, it } from 'bun:test';
import {
  averageThumbRegion,
  coverSourceRect,
  resolveBackgroundSource,
  type Thumb,
} from './wallpaperSampler.js';

describe('wallpaperSampler - resolveBackgroundSource', () => {
  it('prefers the active image over static', () => {
    const src = resolveBackgroundSource({
      active: true,
      image: { src: 'active.jpg', next: '', author: '', profile: '', origin: '' },
      static: 'static.jpg',
    } as never);
    expect(src).toEqual({ kind: 'image', src: 'active.jpg' });
  });

  it('falls back to static when inactive, then to the image src', () => {
    expect(
      resolveBackgroundSource({
        active: false,
        image: { src: 'img.jpg', next: '', author: '', profile: '', origin: '' },
        static: 'static.jpg',
      } as never),
    ).toEqual({ kind: 'image', src: 'static.jpg' });

    expect(
      resolveBackgroundSource({
        active: false,
        image: { src: 'img.jpg', next: '', author: '', profile: '', origin: '' },
      } as never),
    ).toEqual({ kind: 'image', src: 'img.jpg' });
  });

  it('falls back to color and none', () => {
    expect(resolveBackgroundSource({ color: '#abc' } as never)).toEqual({
      kind: 'color',
      color: '#abc',
    });
    expect(resolveBackgroundSource(undefined)).toEqual({ kind: 'none' });
  });
});

describe('wallpaperSampler - coverSourceRect', () => {
  it('maps 1:1 when image and viewport match', () => {
    const r = coverSourceRect(
      { w: 200, h: 100 },
      { w: 200, h: 100 },
      { x: 10, y: 20, w: 50, h: 30 },
    );
    expect(r.sx).toBeCloseTo(10);
    expect(r.sy).toBeCloseTo(20);
    expect(r.sw).toBeCloseTo(50);
    expect(r.sh).toBeCloseTo(30);
  });

  it('centers the crop when the image is scaled to cover', () => {
    // 100x100 image on a 200x100 viewport: scale 2, displayed 200x200,
    // vertically centered with -50px offset. Full viewport maps to full image.
    const r = coverSourceRect(
      { w: 100, h: 100 },
      { w: 200, h: 100 },
      { x: 0, y: 0, w: 200, h: 100 },
    );
    expect(r.sx).toBeCloseTo(0);
    expect(r.sy).toBeCloseTo(25);
    expect(r.sw).toBeCloseTo(100);
    expect(r.sh).toBeCloseTo(50);
  });

  it('clamps rects extending outside the viewport', () => {
    const r = coverSourceRect(
      { w: 200, h: 200 },
      { w: 200, h: 200 },
      { x: -50, y: -50, w: 100, h: 100 },
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
    const avg = averageThumbRegion(thumb, { sx: 0, sy: 0, sw: 200, sh: 200 });
    expect(avg).toEqual({ r: 128, g: 128, b: 128 });
  });

  it('averages a sub-region (top-left quadrant = red)', () => {
    const avg = averageThumbRegion(thumb, { sx: 0, sy: 0, sw: 100, sh: 100 });
    expect(avg).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('returns null for empty regions', () => {
    expect(averageThumbRegion(thumb, { sx: 0, sy: 0, sw: 0, sh: 100 })).toBeNull();
  });
});
