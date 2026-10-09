import { describe, expect, it } from 'bun:test';
import Time from './time.js';

describe('Time class', () => {
  it('instantiates with defaults', () => {
    const time = new Time('en', false);
    expect(time.locale).toBe('en');
    expect(time.showSeconds).toBe(false);
  });

  it('formats time string for a fixed timestamp', () => {
    const time = new Time('en', false),
      date = new Date(2026, 0, 1, 12, 30, 0),
      formatted = time.format(date.getTime(), false);
    expect(formatted).toContain('12:30');
  });

  it('formats time string with seconds enabled', () => {
    const time = new Time('en', true),
      date = new Date(2026, 0, 1, 12, 30, 45),
      formatted = time.format(date.getTime(), true);
    expect(formatted).toContain('45');
  });

  it('formats date using custom dateSetting options', () => {
    const time = new Time('en', false, {
        date: 'numeric',
        month: 'short',
        weekday: 'short',
      }),
      dateStr = time.getDate();
    expect(typeof dateStr).toBe('string');
    expect(dateStr.length).toBeGreaterThan(0);
  });
});
