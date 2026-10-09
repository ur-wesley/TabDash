import { Show, createSignal, createMemo } from 'solid-js';
import type { Component } from 'solid-js';
import type { AvailableLanguages } from '../../lang';
import { availableLanguages, helpLinks } from '../../lang';
import { theme } from '../../../types/settings';
import { Button } from '../../components/ui/button';
import { ColorPicker } from '../../components/ui/color-picker';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import type { SelectOption } from '../../components/ui/select';
import { Sheet } from '../../components/ui/sheet';
import { Slider } from '../../components/ui/slider';
import { Switch } from '../../components/ui/switch';
import { Tabs } from '../../components/ui/tabs';
import { useI18n } from '../../i18n';
import { AppearanceTab } from './appearance-tab';
import { CategorySection } from './category-section';
import { ManagementTab } from './management-tab';
import { SettingsSearch } from './settings-search';
import {
  SEARCH_ENGINE_OPTIONS,
  shortcutStyleOptions as getShortcutStyleOptions,
  weatherUnitOptions as getWeatherUnitOptions,
} from './setting-options';
import { useSettingsContext } from './settings-context';
import { WidgetsTab } from './widgets-tab';

const languageLabels: Record<AvailableLanguages, string> = {
    de: 'Deutsch',
    en: 'English',
    es: 'Español',
    fr: 'Français',
  },
  languageOptions: readonly SelectOption[] = availableLanguages.map((key) => ({
    name: languageLabels[key] ?? key,
    value: key,
  })),
  searchEngineOptions: readonly SelectOption[] = SEARCH_ENGINE_OPTIONS;

export interface SettingsSheetProps {
  readonly onCustomizeLayout?: () => void;
}

export const SettingsSheet: Component<SettingsSheetProps> = (props) => {
  const { t, locale, setLocale } = useI18n(),
    [state, actions] = useSettingsContext(),
    [isOpen, setIsOpen] = createSignal(false),
    [activeTab, setActiveTab] = createSignal('general'),
    [searchQuery, setSearchQuery] = createSignal(''),
    getHelpLink = (path?: string) => (path ? `${helpLinks.base}${locale()}${path}` : undefined),
    themeOptions = createMemo<readonly SelectOption[]>(() =>
      theme.map((key) => ({
        name: t(key),
        value: key,
      })),
    ),
    weatherUnitOptions = createMemo<readonly SelectOption[]>(() => getWeatherUnitOptions(t)),
    shortcutStyleOptions = createMemo<readonly SelectOption[]>(() => getShortcutStyleOptions(t));

  return (
    <Sheet open={isOpen()} onOpenChange={setIsOpen}>
      <Sheet.Trigger
        class="z-40 widget fixed right-3 bottom-3 p-2.5 rounded-xl border-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-lg hover:scale-105 active:scale-95 transition-all bg-zinc-900/80 backdrop-blur-md text-zinc-200"
        aria-label={t('settings')}
      >
        <span
          class="i-mdi-cog text-2xl block transition-transform duration-300"
          style={{
            transform: isOpen() ? 'rotate(90deg)' : 'none',
          }}
          aria-hidden="true"
        />
      </Sheet.Trigger>

      <Sheet.Portal>
        <Sheet.Overlay />
        <Sheet.Content class="flex flex-col p-0">
          <Sheet.Header class="px-5 py-3.5 shrink-0">
            <Sheet.Title class="text-sm font-semibold tracking-wider text-slate-900 dark:text-zinc-100">
              {t('settings')}
            </Sheet.Title>
            <Sheet.CloseButton aria-label={t('close')} />
          </Sheet.Header>

          <div class="p-4 flex flex-col gap-4 overflow-y-auto flex-1 w-full">
            {/* Global Search Bar */}
            <div class="relative w-full flex items-center">
              <span class="absolute left-3.5 pointer-events-none text-slate-400 dark:text-zinc-400 i-mdi-magnify w-4 h-4" />
              <input
                type="search"
                class="w-full pl-10 pr-9 py-2 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md rounded-xl text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 border border-black/5 dark:border-white/10 focus:border-blue-500 focus:bg-white/70 dark:focus:bg-zinc-800/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                placeholder={t('search settings placeholder')}
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && searchQuery()) {
                    e.preventDefault();
                    setSearchQuery('');
                  }
                }}
              />
              <Show when={Boolean(searchQuery())}>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  class="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  aria-label={t('clear search')}
                >
                  <span class="i-mdi-close w-3.5 h-3.5 block" />
                </button>
              </Show>
            </div>

            <Show when={searchQuery().trim().length > 0}>
              <SettingsSearch
                query={searchQuery()}
                onClear={() => setSearchQuery('')}
                onSelectTab={(tab) => {
                  setActiveTab(tab);
                  setSearchQuery('');
                }}
                languageOptions={languageOptions}
                themeOptions={themeOptions()}
                searchEngineOptions={searchEngineOptions}
                weatherUnitOptions={weatherUnitOptions()}
                shortcutStyleOptions={shortcutStyleOptions()}
              />
            </Show>

            <Show when={searchQuery().trim().length === 0}>
              <Tabs.Root value={activeTab()} onChange={setActiveTab} class="w-full">
                <Tabs.List class="grid grid-cols-4 w-full p-1 gap-1">
                  <Tabs.Trigger value="general" class="group flex-row gap-1 px-1 py-2 text-center">
                    <span class="tabs-trigger-icon i-mdi-tune w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span class="min-w-0 flex-1 capitalize truncate">{t('general')}</span>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="widgets" class="group flex-row gap-1 px-1 py-2 text-center">
                    <span class="tabs-trigger-icon i-mdi-widgets-outline w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span class="min-w-0 flex-1 capitalize truncate">{t('widgets')}</span>
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="appearance"
                    class="group flex-row gap-1 px-1 py-2 text-center"
                  >
                    <span class="tabs-trigger-icon i-mdi-palette-outline w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span class="min-w-0 flex-1 capitalize truncate">{t('appearance')}</span>
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="management"
                    class="group flex-row gap-1 px-1 py-2 text-center"
                  >
                    <span class="tabs-trigger-icon i-mdi-database-outline w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span class="min-w-0 flex-1 capitalize truncate">{t('management')}</span>
                  </Tabs.Trigger>
                </Tabs.List>

                {/* General Tab */}
                <Tabs.Content value="general" class="w-full flex flex-col gap-3 pt-2">
                  <CategorySection title={t('general')} helpLink={getHelpLink(helpLinks.general)}>
                    <Select
                      label={t('language')}
                      value={state.general.locale}
                      options={languageOptions}
                      onChange={(val) => {
                        actions.updateGeneral({ locale: val as AvailableLanguages });
                        setLocale(val as AvailableLanguages);
                      }}
                    />
                    <Select
                      label={t('theme')}
                      value={state.general.theme}
                      options={themeOptions()}
                      onChange={(val) => {
                        actions.updateGeneral({
                          theme: val as 'automatic' | 'light' | 'dark',
                        });
                      }}
                    />
                    <Switch
                      label={t('sync')}
                      checked={state.general.sync}
                      onChange={(val) => {
                        actions.updateGeneral({ sync: val });
                      }}
                    />
                  </CategorySection>

                  <CategorySection
                    title={t('background')}
                    helpLink={getHelpLink(helpLinks.background)}
                  >
                    <Switch
                      label={t('bg active')}
                      checked={state.background.active}
                      onChange={(val) => {
                        actions.updateBackground({ active: val });
                      }}
                    />
                    <Show when={state.background.active}>
                      <Input
                        label={t('collections')}
                        value={state.background.collections?.join(', ') ?? ''}
                        onInput={(e) => {
                          actions.updateBackground({
                            collections: e.currentTarget.value
                              .split(',')
                              .map((i) => i.trim())
                              .filter(Boolean),
                          });
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        class="mt-1 w-full flex items-center justify-center gap-1.5 rounded-xl group"
                        onClick={() => void actions.refreshImage()}
                      >
                        <span
                          class="i-mdi-refresh text-base group-hover:rotate-180 transition-transform duration-500"
                          aria-hidden="true"
                        />
                        <span>{t('reload img')}</span>
                      </Button>
                    </Show>
                    <Show when={!state.background.active}>
                      <Input
                        label={t('static img')}
                        value={state.background.static ?? ''}
                        onInput={(e) => {
                          actions.updateBackground({ static: e.currentTarget.value });
                        }}
                      />
                      <ColorPicker
                        label={t('color')}
                        value={state.background.color ?? '#000000'}
                        onChange={(color) => {
                          actions.updateBackground({ color });
                        }}
                      />
                    </Show>
                    <Switch
                      label={t('backdrop')}
                      checked={state.background.backdropActive}
                      onChange={(val) => {
                        actions.updateBackground({ backdropActive: val });
                      }}
                    />
                    <Show when={state.background.backdropActive}>
                      <Slider
                        label={t('blur')}
                        min={0}
                        max={50}
                        value={Number.parseInt(state.background.backdrop?.blur || '0', 10) || 0}
                        onChange={(val) => {
                          actions.updateBackground({
                            backdrop: {
                              ...state.background.backdrop,
                              blur: `${val}px`,
                            },
                          });
                        }}
                        showValue
                      />
                      <Slider
                        label={t('brightness')}
                        min={0}
                        max={200}
                        value={
                          Number.parseInt(state.background.backdrop?.brightness || '100', 10) || 100
                        }
                        onChange={(val) => {
                          actions.updateBackground({
                            backdrop: {
                              ...state.background.backdrop,
                              brightness: `${val}%`,
                            },
                          });
                        }}
                        showValue
                      />
                      <Slider
                        label={t('saturate')}
                        min={0}
                        max={200}
                        value={
                          Number.parseInt(state.background.backdrop?.saturate || '100', 10) || 100
                        }
                        onChange={(val) => {
                          actions.updateBackground({
                            backdrop: {
                              ...state.background.backdrop,
                              saturate: `${val}%`,
                            },
                          });
                        }}
                        showValue
                      />
                    </Show>
                  </CategorySection>
                </Tabs.Content>

                {/* Widgets Tab */}
                <Tabs.Content value="widgets" class="w-full">
                  <WidgetsTab
                    searchEngineOptions={searchEngineOptions}
                    weatherUnitOptions={weatherUnitOptions()}
                    shortcutStyleOptions={shortcutStyleOptions()}
                    onCustomizeLayout={props.onCustomizeLayout}
                    onCloseSheet={() => setIsOpen(false)}
                  />
                </Tabs.Content>

                {/* Appearance Tab */}
                <Tabs.Content value="appearance" class="pt-2 w-full">
                  <AppearanceTab />
                </Tabs.Content>

                {/* Management Tab */}
                <Tabs.Content value="management" class="pt-2 w-full">
                  <ManagementTab />
                </Tabs.Content>
              </Tabs.Root>
            </Show>
          </div>
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet>
  );
};
