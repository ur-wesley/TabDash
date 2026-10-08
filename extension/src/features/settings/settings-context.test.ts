import { describe, expect, it } from 'bun:test';
import { createRoot } from 'solid-js';
import type { Setting } from '../../../types/settings';
import { createSettingsStore } from './settings-context';

const mockDefaultSettings: Setting = {
  id: 'test-id',
  general: {
    locale: 'en',
    theme: 'dark',
    sync: false,
    username: 'User',
    favicon: '',
    title: 'TabDash',
  },
  background: {
    active: true,
    backdropActive: false,
    color: '#000000',
    backdrop: { blur: '0px', saturate: '100%', brightness: '100%' },
    image: { src: '', next: '', author: '', profile: '', origin: '' },
    collections: [],
  },
  shortcutAppereance: {
    style: 'large',
    elementsPerLine: 5,
    iconOnly: false,
  },
  shortcuts: [],
  layout: {
    showClock: true,
    showDate: true,
    showWeather: false,
    showSearchbar: true,
    showShortcuts: true,
    showGreeting: true,
    mode: 'canvas',
  },
  clock: {
    showSeconds: false,
  },
  date: {
    weekday: 'long',
    date: '2-digit',
    month: 'long',
  },
  weather: {
    unit: 'metric',
    showIcon: true,
    showText: false,
  },
  search: {
    focus: false,
    newTab: false,
    engine: 'google',
  },
  cache: {
    images: [],
  },
  widgetSetting: {
    light: {
      textColor: '#000000',
      textSize: '16px',
      background: 'rgba(255, 255, 255, 0.4)',
      borderRadius: '12px',
      shadow: 'none',
      font: 'Calibri',
      weight: '400',
      backdrop: {
        blur: '6px',
        saturate: '120%',
        brightness: '160%',
      },
    },
    dark: {
      textColor: '#ffffff',
      textSize: '16px',
      background: 'rgba(64, 64, 64, 0.4)',
      borderRadius: '12px',
      shadow: 'none',
      font: 'Calibri',
      weight: '400',
      backdrop: {
        blur: '6px',
        saturate: '120%',
        brightness: '160%',
      },
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
      actions.addShortcut({ name: 'GitHub', link: 'https://github.com', icon: '' });
      expect(state.shortcuts.length).toBe(1);
      expect(state.shortcuts[0]?.name).toBe('GitHub');

      // Test editing shortcut
      actions.editShortcut(0, { name: 'GitHub Updated', link: 'https://github.com', icon: '' });
      expect(state.shortcuts[0]?.name).toBe('GitHub Updated');

      // Test updating general setting
      actions.updateGeneral({ theme: 'light' });
      expect(state.general.theme).toBe('light');

      // Test removing shortcut
      actions.removeShortcut({ name: 'GitHub Updated', link: 'https://github.com', icon: '' });
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
          weight: '700',
          shadow: 'rgba(0,0,0,0.5) 1px 2px 6px',
        },
      });
      expect(state.widgetSetting.dark.font).toBe('Inter');
      expect(state.widgetSetting.dark.weight).toBe('700');
      expect(state.widgetSetting.dark.shadow).toBe('rgba(0,0,0,0.5) 1px 2px 6px');

      // Test updating date setting
      actions.updateDate({ weekday: 'short', month: 'short' });
      expect(state.date.weekday).toBe('short');
      expect(state.date.month).toBe('short');

      dispose();
    });
  });
});
