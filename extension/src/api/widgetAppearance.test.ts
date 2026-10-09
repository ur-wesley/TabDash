import { describe, expect, it } from 'bun:test';
import widgetAppearance from './widgetAppearance.js';

describe('widgetAppearance', () => {
  it('does not throw when passed undefined or empty object', () => {
    // Setup document mock if running outside full browser DOM
    if (globalThis.document === undefined) {
      const styleMap = new Map<string, string>();
      globalThis.document = {
        documentElement: {
          style: {
            getPropertyValue: (key: string) => styleMap.get(key) || '',
            setProperty: (key: string, val: string) => styleMap.set(key, val),
          },
        },
      } as unknown as Document;
    }

    expect(() => {
      widgetAppearance();
    }).not.toThrow();
    expect(() => {
      widgetAppearance({} as unknown as Parameters<typeof widgetAppearance>[0]);
    }).not.toThrow();
  });

  it('sets CSS variables when valid widget appearance is provided', () => {
    const styleMap = new Map<string, string>();
    globalThis.document = {
      documentElement: {
        style: {
          getPropertyValue: (key: string) => styleMap.get(key) || '',
          setProperty: (key: string, val: string) => styleMap.set(key, val),
        },
      },
    } as unknown as Document;

    widgetAppearance({
      backdrop: {
        blur: '10px',
        brightness: '90%',
        saturate: '150%',
      },
      background: '#111111',
      borderRadius: '8px',
      font: 'Arial',
      shadow: 'none',
      textColor: '#ffffff',
      textSize: '14px',
      weight: '600',
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
          getPropertyValue: (key: string) => styleMap.get(key) || '',
          setProperty: (key: string, val: string) => styleMap.set(key, val),
        },
      },
    } as unknown as Document;

    // Dark background with dark text
    widgetAppearance(
      {
        background: '#111111',
        textColor: '#1a1a1a',
      } as Parameters<typeof widgetAppearance>[0],
      { autoContrast: true },
    );

    // Should automatically ensure contrast by choosing high-contrast text (#ffffff)
    expect(styleMap.get('--textColor')).toBe('#ffffff');
    expect(styleMap.get('--contrastTextColor')).toBe('#ffffff');
  });
});
