import { For, Show, createMemo } from 'solid-js';
import type { Component } from 'solid-js';
import type { MessageKey } from '../../lang';
import { Button } from '../../components/ui/button';
import type { SelectOption } from '../../components/ui/select';
import { useI18n } from '../../i18n';
import { SettingsSearchControl } from './settings-search-control';

export interface SettingsSearchProps {
  query: string;
  onClear: () => void;
  onSelectTab: (tab: string) => void;
  languageOptions: readonly SelectOption[];
  themeOptions: readonly SelectOption[];
  searchEngineOptions: readonly SelectOption[];
  weatherUnitOptions: readonly SelectOption[];
  shortcutStyleOptions: readonly SelectOption[];
}

interface SearchItem {
  id: string;
  name: string;
  category: 'general' | 'widgets' | 'appearance' | 'management';
  subcategory?: string;
  keywords: string[];
}

export const SettingsSearch: Component<SettingsSearchProps> = (props) => {
  const { t } = useI18n(),
    searchItems = createMemo<SearchItem[]>(() => [
      {
        category: 'general',
        id: 'language',
        keywords: ['language', 'sprache', 'langue', 'idioma', 'translation'],
        name: t('language') || 'Language',
        subcategory: 'locale',
      },
      {
        category: 'general',
        id: 'theme',
        keywords: ['theme', 'dark', 'light', 'automatic', 'system', 'dunkel', 'hell', 'mode'],
        name: t('theme') || 'Theme',
        subcategory: 'theme',
      },
      {
        category: 'general',
        id: 'sync',
        keywords: ['sync', 'cloud', 'browser sync', 'storage'],
        name: t('sync') || 'Sync',
        subcategory: 'browser',
      },
      {
        category: 'general',
        id: 'bg-active',
        keywords: ['background', 'wallpaper', 'unsplash', 'photo', 'hintergrund'],
        name: t('bg active') || 'Background Active',
        subcategory: 'background',
      },
      {
        category: 'general',
        id: 'collections',
        keywords: ['collections', 'sammlungen', 'nature', 'tags'],
        name: t('collections') || 'Collections',
        subcategory: 'background',
      },
      {
        category: 'general',
        id: 'static-img',
        keywords: ['static', 'image', 'url', 'statisches bild'],
        name: t('static img') || 'Static Image',
        subcategory: 'background',
      },
      {
        category: 'general',
        id: 'color',
        keywords: ['color', 'farbe', 'solid color'],
        name: t('color') || 'Color',
        subcategory: 'background',
      },
      {
        category: 'general',
        id: 'backdrop',
        keywords: [
          'backdrop',
          'filter',
          'blur',
          'brightness',
          'saturate',
          'hintergrundfilter',
          'verwischen',
        ],
        name: t('backdrop') || 'Backdrop',
        subcategory: 'background',
      },
      {
        category: 'widgets',
        id: 'show-clock',
        keywords: ['clock', 'time', 'uhr', 'uhrzeit', 'hour'],
        name: t('show clock') || 'Show Clock',
        subcategory: 'clock',
      },
      {
        category: 'widgets',
        id: 'show-date',
        keywords: ['date', 'calendar', 'datum', 'kalender', 'tag'],
        name: t('show date') || 'Show Date',
        subcategory: 'clock',
      },
      {
        category: 'widgets',
        id: 'show-seconds',
        keywords: ['seconds', 'sekunden', 'ticker', 'precision'],
        name: t('show seconds') || 'Show Seconds',
        subcategory: 'clock',
      },
      {
        category: 'widgets',
        id: 'show-weather',
        keywords: ['weather', 'wetter', 'temperature', 'forecast'],
        name: t('show weather') || 'Show Weather',
        subcategory: 'weather',
      },
      {
        category: 'widgets',
        id: 'unit',
        keywords: ['unit', 'celsius', 'fahrenheit', 'metric', 'imperial', 'grad', 'einheit'],
        name: t('unit') || 'Weather Unit',
        subcategory: 'weather',
      },
      {
        category: 'widgets',
        id: 'show-search',
        keywords: ['search', 'suche', 'searchbar', 'suchleiste'],
        name: t('show search') || 'Show Search',
        subcategory: 'search',
      },
      {
        category: 'widgets',
        id: 'search-engine',
        keywords: ['search engine', 'suchmaschine', 'google', 'duckduckgo', 'ecosia', 'bing'],
        name: t('search engine') || 'Search Engine',
        subcategory: 'search',
      },
      {
        category: 'widgets',
        id: 'auto-focus',
        keywords: ['focus', 'cursor', 'autofocus', 'fokussieren'],
        name: t('auto focus') || 'Auto Focus',
        subcategory: 'search',
      },
      {
        category: 'widgets',
        id: 'show-shortcuts',
        keywords: ['shortcuts', 'schnelllinks', 'bookmarks', 'links'],
        name: t('show shortcuts') || 'Show Shortcuts',
        subcategory: 'shortcuts',
      },
      {
        category: 'widgets',
        id: 'shortcut-style',
        keywords: ['style', 'size', 'small', 'medium', 'large', 'text'],
        name: t('style') || 'Shortcut Style',
        subcategory: 'shortcuts',
      },
      {
        category: 'widgets',
        id: 'shortcut-columns',
        keywords: ['columns', 'spalten', 'grid', 'row'],
        name: t('columns') || 'Shortcut Columns',
        subcategory: 'shortcuts',
      },
      {
        category: 'widgets',
        id: 'shortcut-icon-only',
        keywords: ['icon only', 'nur symbol', 'minimal'],
        name: t('icon only') || 'Icon Only',
        subcategory: 'shortcuts',
      },
      {
        category: 'widgets',
        id: 'show-greeting',
        keywords: ['greeting', 'gruß', 'gruss', 'welcome', 'hallo'],
        name: t('show greeting') || 'Show Greeting',
        subcategory: 'greeting',
      },
      {
        category: 'appearance',
        id: 'appearance',
        keywords: [
          'appearance',
          'styling',
          'widget',
          'font',
          'shadow',
          'border',
          'radius',
          'text color',
        ],
        name: t('appearance') || 'Appearance',
        subcategory: 'widgets',
      },
      {
        category: 'management',
        id: 'management',
        keywords: [
          'management',
          'backup',
          'export',
          'import',
          'restore',
          'reset',
          'cloud',
          'clipboard',
        ],
        name: t('management') || 'Management',
        subcategory: 'data',
      },
    ]),
    filtered = createMemo(() => {
      const q = (props.query ?? '').trim().toLowerCase();
      if (!q) {
        return [];
      }
      return searchItems().filter((item) => {
        if (!item) {
          return false;
        }
        const name = (item.name ?? '').toLowerCase();
        if (name.includes(q)) {
          return true;
        }
        const category = (item.category ?? '').toLowerCase();
        if (category.includes(q)) {
          return true;
        }
        const subcategory = (item.subcategory ?? '').toLowerCase();
        if (subcategory && subcategory.includes(q)) {
          return true;
        }
        return (
          Array.isArray(item.keywords) &&
          item.keywords.some((kw) => typeof kw === 'string' && kw.toLowerCase().includes(q))
        );
      });
    });

  return (
    <div class="w-full min-w-0 flex flex-col gap-3">
      <div class="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-zinc-400">
        <span>
          {filtered().length} {t('results found')}
        </span>
        <button
          type="button"
          onClick={props.onClear}
          class="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          {t('clear search')}
        </button>
      </div>

      <Show
        when={filtered().length > 0}
        fallback={
          <div class="w-full p-6 text-center flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-100/70 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/50 shadow-sm transition-colors">
            <span class="i-mdi-magnify-remove-outline text-3xl text-slate-400 dark:text-zinc-500" />
            <span class="text-sm font-medium text-slate-800 dark:text-zinc-200">
              {t('no settings found')}
            </span>
            <p class="text-xs text-slate-500 dark:text-zinc-400">"{props.query}"</p>
            <div class="mt-2">
              <Button variant="outline" size="sm" onClick={props.onClear}>
                {t('clear search')}
              </Button>
            </div>
          </div>
        }
      >
        <div class="w-full flex flex-col gap-2.5">
          <For each={filtered()}>
            {(item) => (
              <div class="w-full rounded-xl bg-slate-100/70 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/50 p-3.5 flex flex-col gap-2.5 shadow-sm transition-colors">
                <div class="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-zinc-700/40">
                  <button
                    type="button"
                    onClick={() => {
                      props.onSelectTab(item.category);
                      props.onClear();
                    }}
                    class="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    <span class="capitalize">
                      {t(item.category as MessageKey) || item.category}
                    </span>
                    <Show when={item.subcategory}>
                      <span class="text-slate-400 dark:text-zinc-500">/</span>
                      <span class="capitalize text-slate-600 dark:text-zinc-300">
                        {item.subcategory}
                      </span>
                    </Show>
                    <span class="i-mdi-arrow-right w-3.5 h-3.5 opacity-60" />
                  </button>
                </div>

                <SettingsSearchControl
                  id={item.id}
                  name={item.name}
                  category={item.category}
                  onSelectTab={props.onSelectTab}
                  onClear={props.onClear}
                  languageOptions={props.languageOptions}
                  themeOptions={props.themeOptions}
                  searchEngineOptions={props.searchEngineOptions}
                  weatherUnitOptions={props.weatherUnitOptions}
                  shortcutStyleOptions={props.shortcutStyleOptions}
                />
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
