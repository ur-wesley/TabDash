import { createMemo, createSignal, Show } from 'solid-js';
import type { Component } from 'solid-js';
import type { WidgetAppereance } from '../../../types/settings';
import widgetAppearance from '../../api/widgetAppearance';
import { ColorPicker } from '../../components/ui/color-picker';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import type { SelectOption } from '../../components/ui/select';
import { Slider } from '../../components/ui/slider';
import { Tabs } from '../../components/ui/tabs';
import { useI18n } from '../../i18n';
import { CategorySection } from './category-section';
import { useSettingsContext } from './settings-context';

const FONT_PRESETS: readonly { value: string; name: string }[] = [
  { name: 'Calibri (Default)', value: 'Calibri' },
  { name: 'Inter', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Segoe UI', value: 'Segoe UI' },
  { name: 'Arial', value: 'Arial' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'Times New Roman', value: 'Times New Roman' },
  { name: 'Courier New', value: 'Courier New' },
  { name: 'JetBrains Mono', value: 'JetBrains Mono' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'System UI', value: 'system-ui' },
  { name: 'Custom Font...', value: 'custom' },
];

export const AppearanceTab: Component = () => {
  const { t } = useI18n(),
    [state, actions] = useSettingsContext(),
    [mode, setMode] = createSignal<'light' | 'dark'>(
      state.general?.theme === 'dark' ? 'dark' : 'light',
    ),
    currentModeSettings = () => state.widgetSetting[mode()],
    updateAppearance = (patch: Partial<WidgetAppereance>) => {
      actions.updateWidgetAppearance({
        mode: mode(),
        patch,
      });
      const updated = { ...currentModeSettings(), ...patch };
      widgetAppearance(updated);
    },
    handleModeChange = (newMode: 'light' | 'dark') => {
      setMode(newMode);
      const target = state.widgetSetting[newMode];
      if (target) {
        widgetAppearance(target);
      }
    },
    weightOptions = createMemo<readonly SelectOption[]>(() => [
      { name: `${t('thin weight')} (300)`, value: '300' },
      { name: `${t('normal weight')} (400)`, value: '400' },
      { name: 'Semi Bold (600)', value: '600' },
      { name: `${t('medium weight')} (700)`, value: '700' },
      { name: `${t('big weight')} (900)`, value: '900' },
    ]),
    currentFont = () => currentModeSettings().font || 'Calibri',
    isCustomFont = () =>
      !FONT_PRESETS.some((f) => f.value === currentFont() && f.value !== 'custom'),
    selectedFontOption = () => (isCustomFont() ? 'custom' : currentFont()),
    shadowAlpha = () => {
      const s = currentModeSettings().shadow;
      if (!s || s === 'none') {
        return 0;
      }
      const parts = s.split(',');
      if (parts.length >= 4) {
        const alpha = Number.parseFloat(parts[3]?.split(')')[0] ?? '');
        return Number.isNaN(alpha) ? 0 : alpha;
      }
      return 0;
    };

  return (
    <div class="w-full flex flex-col gap-4">
      <Tabs.Root
        value={mode()}
        onChange={(v) => {
          handleModeChange(v as 'light' | 'dark');
        }}
        class="w-full"
      >
        <Tabs.List class="grid grid-cols-2 w-full p-1 gap-1">
          <Tabs.Trigger
            value="dark"
            class="group py-2 text-xs rounded-lg font-medium flex items-center justify-center gap-1.5"
          >
            <span class="tabs-trigger-icon tabs-trigger-icon-indigo i-mdi-weather-night w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
            <span class="capitalize">{t('dark')}</span>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="light"
            class="group py-2 text-xs rounded-lg font-medium flex items-center justify-center gap-1.5"
          >
            <span class="tabs-trigger-icon tabs-trigger-icon-amber i-mdi-white-balance-sunny w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
            <span class="capitalize">{t('light')}</span>
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      <CategorySection title={t('appearance')}>
        <ColorPicker
          label={t('text color')}
          value={currentModeSettings().textColor}
          onChange={(color) => {
            updateAppearance({ textColor: color });
          }}
        />

        <ColorPicker
          label={t('background')}
          value={currentModeSettings().background}
          onChange={(color) => {
            updateAppearance({ background: color });
          }}
        />

        <Slider
          label={t('text size')}
          min={8}
          max={32}
          showValue
          value={Number.parseInt(currentModeSettings().textSize, 10) || 16}
          onChange={(val) => {
            updateAppearance({ textSize: `${val}px` });
          }}
        />

        <Slider
          label={t('border radius')}
          min={0}
          max={36}
          showValue
          value={Number.parseInt(currentModeSettings().borderRadius, 10) || 12}
          onChange={(val) => {
            updateAppearance({ borderRadius: `${val}px` });
          }}
        />

        <Select
          label={t('font')}
          value={selectedFontOption()}
          options={FONT_PRESETS}
          onChange={(val) => {
            if (val !== 'custom') {
              updateAppearance({ font: val });
            }
          }}
        />

        <Show when={selectedFontOption() === 'custom' || isCustomFont()}>
          <Input
            label={t('custom font')}
            placeholder="e.g. 'Fira Code', 'Helvetica', serif"
            value={currentFont()}
            onInput={(e) => {
              updateAppearance({ font: e.currentTarget.value });
            }}
          />
        </Show>

        <Select
          label={t('font weight')}
          value={currentModeSettings().weight || '400'}
          options={weightOptions()}
          onChange={(val) => {
            updateAppearance({ weight: val });
          }}
        />

        <Slider
          label={t('text shadow')}
          min={0}
          max={1}
          step={0.05}
          showValue
          value={shadowAlpha()}
          onChange={(val) => {
            updateAppearance({
              shadow: `rgba(0,0,0,${val}) 1px 2px 6px`,
            });
          }}
        />
      </CategorySection>

      <CategorySection title={t('backdrop')}>
        <Slider
          label={t('blur')}
          min={0}
          max={40}
          showValue
          value={Number.parseInt(currentModeSettings().backdrop?.blur ?? '6px', 10) || 0}
          onChange={(val) => {
            updateAppearance({
              backdrop: {
                ...currentModeSettings().backdrop,
                blur: `${val}px`,
              },
            });
          }}
        />

        <Slider
          label={t('saturate')}
          min={50}
          max={200}
          showValue
          value={Number.parseInt(currentModeSettings().backdrop?.saturate ?? '120%', 10) || 100}
          onChange={(val) => {
            updateAppearance({
              backdrop: {
                ...currentModeSettings().backdrop,
                saturate: `${val}%`,
              },
            });
          }}
        />

        <Slider
          label={t('brightness')}
          min={50}
          max={200}
          showValue
          value={Number.parseInt(currentModeSettings().backdrop?.brightness ?? '160%', 10) || 100}
          onChange={(val) => {
            updateAppearance({
              backdrop: {
                ...currentModeSettings().backdrop,
                brightness: `${val}%`,
              },
            });
          }}
        />
      </CategorySection>
    </div>
  );
};
