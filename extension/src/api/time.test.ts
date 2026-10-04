import { describe, expect, it } from 'bun:test';
import Time from './time.js';

describe('Time class', () => {
  it('instantiates with defaults', () => {
    const time = new Time('en', false);
    expect(time.locale).toBe('en');
    expect(time.showSeconds).toBe(false);
  });

  it('formats time string for a fixed timestamp', () => {
    const time = new Time('en', false);
    const date = new Date(2026, 0, 1, 12, 30, 0);
    const formatted = time.format(date.getTime(), false);
    expect(formatted).toContain('12:30');
  });

  it('formats time string with seconds enabled', () => {
    const time = new Time('en', true);
    const date = new Date(2026, 0, 1, 12, 30, 45);
    const formatted = time.format(date.getTime(), true);
    expect(formatted).toContain('45');
  });
});
