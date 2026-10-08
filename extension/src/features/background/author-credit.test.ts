import { describe, expect, it } from 'bun:test';
import { AUTHOR_CREDIT_CLASS, getAuthorCreditContrast } from './author-credit';
import {
  AUTHOR_CREDIT_TEXT_SHADOW,
  UNSPLASH_BASE_URL,
  withUnsplashAttribution,
} from './attribution';
import { DEFAULT_WIDGET_BACKGROUND } from '../../lib/colorContrast';

describe('AuthorCredit widget', () => {
  it('has smaller compact widget classes', () => {
    // Reduced padding and font size
    expect(AUTHOR_CREDIT_CLASS).toContain('px-2');
    expect(AUTHOR_CREDIT_CLASS).toContain('py-0.5');
    expect(AUTHOR_CREDIT_CLASS).toContain('text-[10px]');
    expect(AUTHOR_CREDIT_CLASS).toContain('rounded-tr-md');
    // Does not use old bulky classes
    expect(AUTHOR_CREDIT_CLASS).not.toContain('p-2');
    expect(AUTHOR_CREDIT_CLASS).not.toContain('text-xs');
    expect(AUTHOR_CREDIT_CLASS).not.toContain('rounded-tr-lg');
  });

  it('uses full opacity so every word (incl. "auf"/"on") stays readable', () => {
    expect(AUTHOR_CREDIT_CLASS).not.toContain('opacity-75');
    expect(AUTHOR_CREDIT_CLASS).not.toContain('opacity-80');
  });

  it('exposes a readable text shadow constant for use over photos', () => {
    expect(AUTHOR_CREDIT_TEXT_SHADOW.length).toBeGreaterThan(0);
  });

  it('calculates dark contrasting text for white/light background', () => {
    const style = getAuthorCreditContrast('#ffffff');
    expect(style.color).toBe('#000000');
    expect(style.background).toBe('#ffffff');
  });

  it('calculates light contrasting text for dark background', () => {
    const style = getAuthorCreditContrast('#18181b');
    expect(style.color).toBe('#ffffff');
    expect(style.background).toBe('#18181b');
  });

  it('falls back to the shared widget background constant instead of an inline literal', () => {
    const style = getAuthorCreditContrast(undefined);
    expect(style.color).toBe('#ffffff');
    expect(style.background).toBe(DEFAULT_WIDGET_BACKGROUND);
  });

  it('respects preferred text color when it meets WCAG contrast criteria', () => {
    const style = getAuthorCreditContrast('#000000', '#38bdf8');
    expect(style.color).toBe('#38bdf8');
  });

  it('overrides preferred text color when it fails contrast criteria', () => {
    const style = getAuthorCreditContrast('#ffffff', '#fef08a'); // yellow on white fails
    expect(style.color).toBe('#000000');
  });
});

describe('Unsplash attribution links', () => {
  it('falls back to the shared Unsplash base URL', () => {
    expect(withUnsplashAttribution()).toContain(UNSPLASH_BASE_URL);
    expect(withUnsplashAttribution('')).toContain(UNSPLASH_BASE_URL);
  });

  it('appends referral params without hardcoding them at call sites', () => {
    const url = withUnsplashAttribution('https://unsplash.com/photos/abc');
    expect(url).toContain('utm_source=TabDash');
    expect(url).toContain('utm_medium=referral');
  });
});
