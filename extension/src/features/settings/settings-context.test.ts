import { describe, expect, it } from 'bun:test';
import { createRoot } from 'solid-js';
import type { Setting } from '../../../types/settings';
import { createSettingsStore } from './settings-context';

const mockDefaultSettings: Setting = {
  background: {
    active: true,
    backdrop: { blur: '0px', brightness: '100%', saturate: '100%' },
    backdropActive: false,
    collections: [],
    color: '#000000',
    image: { author: '', next: '', origin: '', profile: '', src: '' },
  },
  cache: {
    images: [],
  },
  clock: {
    showSeconds: false,
  },
  date: {
    date: '2-digit',
    month: 'long',
    weekday: 'long',
  },
  general: {
    favicon: '',
    locale: 'en',
    sync: false,
    theme: 'dark',
    title: 'TabDash',
    username: 'User',
  },
  id: 'test-id',
  layout: {
    mode: 'canvas',
    showClock: true,
    showDate: true,
    showGreeting: true,
    showSearchbar: true,
    showShortcuts: true,
    showWeather: false,
  },
  search: {
    engine: 'google',
    focus: false,
    newTab: false,
  },
  shortcutAppereance: {
    elementsPerLine: 5,
    iconOnly: false,
    style: 'large',
  },
  shortcuts: [],
  weather: {
    showIcon: true,
    showText: false,
    unit: 'metric',
  },
  widgetSetting: {
    dark: {
      backdrop: {
        blur: '6px',
        brightness: '160%',
        saturate: '120%',
      },
      background: 'rgba(64, 64, 64, 0.4)',
      borderRadius: '12px',
      font: 'Calibri',
      shadow: 'none',
      textColor: '#ffffff',
      textSize: '16px',
      weight: '400',
    },
    light: {
      backdrop: {
        blur: '6px',
        brightness: '160%',
        saturate: '120%',
      },
      background: 'rgba(255, 255, 255, 0.4)',
      borderRadius: '12px',
      font: 'Calibri',
      shadow: 'none',
      textColor: '#000000',
      textSize: '16px',
      weight: '400',
    },
  },
};

describe('createSettingsStore', () => {
  it('initializes store and provides reactive actions', () => {
    createRoot((dispose) => {
      const [state, actions] = createSettingsStore(mockDefaultSettings);

      expect(state.id).toBe('test-id');
      expect(state.general.theme).toBe('dark');
      expect(state.shortcuts.length).toBe(0);

      // Test adding shortcut
      actions.addShortcut({ icon: '', link: 'https://github.com', name: 'GitHub' });
      expect(state.shortcuts.length).toBe(1);
      expect(state.shortcuts[0]?.name).toBe('GitHub');

      // Test editing shortcut
      actions.editShortcut(0, { icon: '', link: 'https://github.com', name: 'GitHub Updated' });
      expect(state.shortcuts[0]?.name).toBe('GitHub Updated');

      // Test updating general setting
      actions.updateGeneral({ theme: 'light' });
      expect(state.general.theme).toBe('light');

      // Test removing shortcut
      actions.removeShortcut({ icon: '', link: 'https://github.com', name: 'GitHub Updated' });
      expect(state.shortcuts.length).toBe(0);

      // Test toggling searchbar visibility
      actions.updateLayout({ showSearchbar: false });
      expect(state.layout.showSearchbar).toBe(false);
      expect(state.layout.showSearch).toBe(false);

      actions.updateLayout({ showSearchbar: true });
      expect(state.layout.showSearchbar).toBe(true);
      expect(state.layout.showSearch).toBe(true);

      // Test updating widget font, weight, and shadow appearance
      actions.updateWidgetAppearance({
        mode: 'dark',
        patch: {
          font: 'Inter',
          shadow: 'rgba(0,0,0,0.5) 1px 2px 6px',
          weight: '700',
        },
      });
      expect(state.widgetSetting.dark.font).toBe('Inter');
      expect(state.widgetSetting.dark.weight).toBe('700');
      expect(state.widgetSetting.dark.shadow).toBe('rgba(0,0,0,0.5) 1px 2px 6px');

      // Test updating date setting
      actions.updateDate({ month: 'short', weekday: 'short' });
      expect(state.date.weekday).toBe('short');
      expect(state.date.month).toBe('short');

      dispose();
    });
  });
});
