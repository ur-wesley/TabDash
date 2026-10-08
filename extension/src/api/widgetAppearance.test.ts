import { describe, expect, it } from 'bun:test';
import widgetAppearance from './widgetAppearance.js';

describe('widgetAppearance', () => {
  it('does not throw when passed undefined or empty object', () => {
    // Setup document mock if running outside full browser DOM
    if (typeof globalThis.document === 'undefined') {
      const styleMap = new Map<string, string>();
      globalThis.document = {
        documentElement: {
          style: {
            setProperty: (key: string, val: string) => styleMap.set(key, val),
            getPropertyValue: (key: string) => styleMap.get(key) || '',
          },
        },
      } as unknown as Document;
    }

    expect(() => widgetAppearance(undefined)).not.toThrow();
    expect(() =>
      widgetAppearance({} as unknown as Parameters<typeof widgetAppearance>[0]),
    ).not.toThrow();
  });

  it('sets CSS variables when valid widget appearance is provided', () => {
    const styleMap = new Map<string, string>();
    globalThis.document = {
      documentElement: {
        style: {
          setProperty: (key: string, val: string) => styleMap.set(key, val),
          getPropertyValue: (key: string) => styleMap.get(key) || '',
        },
      },
    } as unknown as Document;

    widgetAppearance({
      textColor: '#ffffff',
      textSize: '14px',
      background: '#111111',
      borderRadius: '8px',
      shadow: 'none',
      font: 'Arial',
      weight: '600',
      backdrop: {
        blur: '10px',
        saturate: '150%',
        brightness: '90%',
      },
    });

    expect(styleMap.get('--textColor')).toBe('#ffffff');
    expect(styleMap.get('--textSize')).toBe('14px');
    expect(styleMap.get('--background')).toBe('#111111');
    expect(styleMap.get('--contrastTextColor')).toBe('#ffffff');
    expect(styleMap.get('--borderRadius')).toBe('8px');
    expect(styleMap.get('--backdrop_blur')).toBe('10px');
  });

  it('adjusts --textColor when autoContrast is enabled and text contrast is insufficient', () => {
    const styleMap = new Map<string, string>();
    globalThis.document = {
      documentElement: {
        style: {
          setProperty: (key: string, val: string) => styleMap.set(key, val),
          getPropertyValue: (key: string) => styleMap.get(key) || '',
        },
      },
    } as unknown as Document;

    // Dark background with dark text
    widgetAppearance(
      {
        textColor: '#1a1a1a',
        background: '#111111',
      } as Parameters<typeof widgetAppearance>[0],
      { autoContrast: true },
    );

    // Should automatically ensure contrast by choosing high-contrast text (#ffffff)
    expect(styleMap.get('--textColor')).toBe('#ffffff');
    expect(styleMap.get('--contrastTextColor')).toBe('#ffffff');
  });
});
