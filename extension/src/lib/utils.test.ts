import { describe, expect, it } from 'bun:test';
import { cn } from './utils.js';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('handles conditional classes and falsy values', () => {
    const isHidden = false;
    expect(cn('base', isHidden && 'hidden', null, undefined, 'active')).toBe('base active');
  });

  it('resolves conflicting tailwind classes via tailwind-merge', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('exports contrast utilities', async () => {
    const utils = await import('./utils.js');
    expect(typeof utils.getContrastRatio).toBe('function');
    expect(typeof utils.ensureWidgetContrast).toBe('function');
    expect(typeof utils.getContrastingTextColor).toBe('function');
  });
});
