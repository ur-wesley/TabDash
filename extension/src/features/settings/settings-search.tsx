import { type Component, For, Show, createMemo } from 'solid-js';
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
  const { t } = useI18n();

  const searchItems = createMemo<SearchItem[]>(() => [
    {
      id: 'language',
      name: t('language') || 'Language',
      category: 'general',
      subcategory: 'locale',
      keywords: ['language', 'sprache', 'langue', 'idioma', 'translation'],
    },
    {
      id: 'theme',
      name: t('theme') || 'Theme',
      category: 'general',
      subcategory: 'theme',
      keywords: ['theme', 'dark', 'light', 'automatic', 'system', 'dunkel', 'hell', 'mode'],
    },
    {
      id: 'sync',
      name: t('sync') || 'Sync',
      category: 'general',
      subcategory: 'browser',
      keywords: ['sync', 'cloud', 'browser sync', 'storage'],
    },
    {
      id: 'bg-active',
      name: t('bg active') || 'Background Active',
      category: 'general',
      subcategory: 'background',
      keywords: ['background', 'wallpaper', 'unsplash', 'photo', 'hintergrund'],
    },
    {
      id: 'collections',
      name: t('collections') || 'Collections',
      category: 'general',
      subcategory: 'background',
      keywords: ['collections', 'sammlungen', 'nature', 'tags'],
    },
    {
      id: 'static-img',
      name: t('static img') || 'Static Image',
      category: 'general',
      subcategory: 'background',
      keywords: ['static', 'image', 'url', 'statisches bild'],
    },
    {
      id: 'color',
      name: t('color') || 'Color',
      category: 'general',
      subcategory: 'background',
      keywords: ['color', 'farbe', 'solid color'],
    },
    {
      id: 'backdrop',
      name: t('backdrop') || 'Backdrop',
      category: 'general',
      subcategory: 'background',
      keywords: [
        'backdrop',
        'filter',
        'blur',
        'brightness',
        'saturate',
        'hintergrundfilter',
        'verwischen',
      ],
    },
    {
      id: 'show-clock',
      name: t('show clock') || 'Show Clock',
      category: 'widgets',
      subcategory: 'clock',
      keywords: ['clock', 'time', 'uhr', 'uhrzeit', 'hour'],
    },
    {
      id: 'show-date',
      name: t('show date') || 'Show Date',
      category: 'widgets',
      subcategory: 'clock',
      keywords: ['date', 'calendar', 'datum', 'kalender', 'tag'],
    },
    {
      id: 'show-seconds',
      name: t('show seconds') || 'Show Seconds',
      category: 'widgets',
      subcategory: 'clock',
      keywords: ['seconds', 'sekunden', 'ticker', 'precision'],
    },
    {
      id: 'show-weather',
      name: t('show weather') || 'Show Weather',
      category: 'widgets',
      subcategory: 'weather',
      keywords: ['weather', 'wetter', 'temperature', 'forecast'],
    },
    {
      id: 'unit',
      name: t('unit') || 'Weather Unit',
      category: 'widgets',
      subcategory: 'weather',
      keywords: ['unit', 'celsius', 'fahrenheit', 'metric', 'imperial', 'grad', 'einheit'],
    },
    {
      id: 'show-search',
      name: t('show search') || 'Show Search',
      category: 'widgets',
      subcategory: 'search',
      keywords: ['search', 'suche', 'searchbar', 'suchleiste'],
    },
    {
      id: 'search-engine',
      name: t('search engine') || 'Search Engine',
      category: 'widgets',
      subcategory: 'search',
      keywords: ['search engine', 'suchmaschine', 'google', 'duckduckgo', 'ecosia', 'bing'],
    },
    {
      id: 'auto-focus',
      name: t('auto focus') || 'Auto Focus',
      category: 'widgets',
      subcategory: 'search',
      keywords: ['focus', 'cursor', 'autofocus', 'fokussieren'],
    },
    {
      id: 'show-shortcuts',
      name: t('show shortcuts') || 'Show Shortcuts',
      category: 'widgets',
      subcategory: 'shortcuts',
      keywords: ['shortcuts', 'schnelllinks', 'bookmarks', 'links'],
    },
    {
      id: 'shortcut-style',
      name: t('style') || 'Shortcut Style',
      category: 'widgets',
      subcategory: 'shortcuts',
      keywords: ['style', 'size', 'small', 'medium', 'large', 'text'],
    },
    {
      id: 'shortcut-columns',
      name: t('columns') || 'Shortcut Columns',
      category: 'widgets',
      subcategory: 'shortcuts',
      keywords: ['columns', 'spalten', 'grid', 'row'],
    },
    {
      id: 'shortcut-icon-only',
      name: t('icon only') || 'Icon Only',
      category: 'widgets',
      subcategory: 'shortcuts',
      keywords: ['icon only', 'nur symbol', 'minimal'],
    },
    {
      id: 'show-greeting',
      name: t('show greeting') || 'Show Greeting',
      category: 'widgets',
      subcategory: 'greeting',
      keywords: ['greeting', 'gruß', 'gruss', 'welcome', 'hallo'],
    },
    {
      id: 'appearance',
      name: t('appearance') || 'Appearance',
      category: 'appearance',
      subcategory: 'widgets',
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
    },
    {
      id: 'management',
      name: t('management') || 'Management',
      category: 'management',
      subcategory: 'data',
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
    },
  ]);

  const filtered = createMemo(() => {
    const q = (props.query ?? '').trim().toLowerCase();
    if (!q) return [];
    return searchItems().filter((item) => {
      if (!item) return false;
      const name = (item.name ?? '').toLowerCase();
      if (name.includes(q)) return true;
      const category = (item.category ?? '').toLowerCase();
      if (category.includes(q)) return true;
      const subcategory = (item.subcategory ?? '').toLowerCase();
      if (subcategory && subcategory.includes(q)) return true;
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
