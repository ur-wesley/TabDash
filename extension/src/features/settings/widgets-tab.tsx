import { type Component, Show, createSignal } from 'solid-js';
import type { DateFormat, LayoutMode, ShortcutStyle } from '../../../types/settings';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { SelectOption } from '../../components/ui/select';
import { Select } from '../../components/ui/select';
import { Slider } from '../../components/ui/slider';
import { Switch } from '../../components/ui/switch';
import { useI18n } from '../../i18n';
import { helpLinks } from '../../lang';
import { CategorySection } from './category-section';
import { useSettingsContext } from './settings-context';
import { IconUpload } from '../shortcuts/icon-upload';

export interface WidgetsTabProps {
  searchEngineOptions: readonly SelectOption[];
  weatherUnitOptions: readonly SelectOption[];
  shortcutStyleOptions: readonly SelectOption[];
  onCustomizeLayout?: () => void;
  onCloseSheet?: () => void;
}

export const WidgetsTab: Component<WidgetsTabProps> = (props) => {
  const { t, locale } = useI18n();
  const [state, actions] = useSettingsContext();

  const [newShortcutName, setNewShortcutName] = createSignal('');
  const [newShortcutLink, setNewShortcutLink] = createSignal('');
  const [newShortcutIcon, setNewShortcutIcon] = createSignal('');
  const [newShortcutNewTab, setNewShortcutNewTab] = createSignal(false);

  const getHelpLink = (path?: string) => (path ? `${helpLinks.base}${locale()}${path}` : undefined);

  const handleAddShortcut = () => {
    const name = newShortcutName().trim();
    let link = newShortcutLink().trim();
    if (!name || !link) return;
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      link = `https://${link}`;
    }
    let icon = newShortcutIcon().trim();
    // Empty means auto-resolve at render time (page-declared icons first,
    // then the static waterfall, then a letter avatar).
    actions.addShortcut({
      name,
      link,
      icon,
      newTab: newShortcutNewTab(),
    });
    setNewShortcutName('');
    setNewShortcutLink('');
    setNewShortcutIcon('');
    setNewShortcutNewTab(false);
  };

  return (
    <div class="w-full flex flex-col gap-3 pt-2">
      <CategorySection title={t('layout')} helpLink={getHelpLink(helpLinks.layout)}>
        <Select
          label={t('layout mode')}
          value={state.layout.mode ?? 'canvas'}
          options={[
            { value: 'canvas', name: t('free canvas') },
            { value: 'flow', name: t('flow order') },
          ]}
          onChange={(val) => actions.updateLayout({ mode: val as LayoutMode })}
        />

        <Show when={(state.layout.mode ?? 'canvas') === 'canvas'}>
          <Switch
            label={t('snap to grid')}
            checked={state.layout.snapToGrid ?? true}
            onChange={(val) => actions.updateLayout({ snapToGrid: val })}
          />
        </Show>

        <Show when={props.onCustomizeLayout}>
          <Button
            variant="outline"
            size="sm"
            class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:border-blue-500/50 shadow-xs transition-all group font-medium"
            onClick={() => {
              props.onCloseSheet?.();
              props.onCustomizeLayout?.();
            }}
          >
            <span
              class="i-mdi-pencil w-4 h-4 text-blue-500 dark:text-blue-400 group-hover:rotate-12 transition-transform"
              aria-hidden="true"
            />
            <span>{t('customize layout')}</span>
            <span
              class="i-mdi-arrow-right w-3.5 h-3.5 ml-auto text-blue-500/70 group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </Button>
        </Show>

        <Switch
          label={t('show clock')}
          checked={state.layout.showClock}
          onChange={(val) => actions.updateLayout({ showClock: val })}
        />
        <Switch
          label={t('show date')}
          checked={state.layout.showDate}
          onChange={(val) => actions.updateLayout({ showDate: val })}
        />
        <Switch
          label={t('show weather')}
          checked={state.layout.showWeather}
          onChange={(val) => actions.updateLayout({ showWeather: val })}
        />
        <Switch
          label={t('show searchbar')}
          checked={state.layout.showSearchbar}
          onChange={(val) => actions.updateLayout({ showSearchbar: val })}
        />
        <Switch
          label={t('show shortcuts')}
          checked={state.layout.showShortcuts}
          onChange={(val) => actions.updateLayout({ showShortcuts: val })}
        />
        <Switch
          label={t('show greeting')}
          checked={state.layout.showGreeting}
          onChange={(val) => actions.updateLayout({ showGreeting: val })}
        />
      </CategorySection>

      <Show when={state.layout.showClock}>
        <CategorySection title={t('clock')} helpLink={getHelpLink(helpLinks.time)}>
          <Switch
            label={t('show seconds')}
            checked={state.clock.showSeconds}
            onChange={(val) => actions.updateClock({ showSeconds: val })}
          />
        </CategorySection>
      </Show>

      <Show when={state.layout.showDate}>
        <CategorySection title={t('date')} helpLink={getHelpLink(helpLinks.date)}>
          <Select
            label={t('weekday')}
            value={state.date?.weekday ?? 'long'}
            options={[
              { value: 'long', name: t('long') },
              { value: 'short', name: t('short') },
              { value: 'narrow', name: t('narrow') },
            ]}
            onChange={(val) => actions.updateDate({ weekday: val as DateFormat })}
          />
          <Select
            label={t('day')}
            value={state.date?.date ?? '2-digit'}
            options={[
              { value: '2-digit', name: t('2-digit') },
              { value: 'numeric', name: t('numeric') },
            ]}
            onChange={(val) => actions.updateDate({ date: val as DateFormat })}
          />
          <Select
            label={t('month')}
            value={state.date?.month ?? 'long'}
            options={[
              { value: 'long', name: t('long') },
              { value: 'short', name: t('short') },
              { value: '2-digit', name: t('2-digit') },
              { value: 'numeric', name: t('numeric') },
            ]}
            onChange={(val) => actions.updateDate({ month: val as DateFormat })}
          />
        </CategorySection>
      </Show>

      <Show when={state.layout.showWeather}>
        <CategorySection title={t('weather')} helpLink={getHelpLink(helpLinks.weather)}>
          <Select
            label={t('unit')}
            value={state.weather.unit}
            options={props.weatherUnitOptions}
            onChange={(val) => actions.updateWeather({ unit: val as 'metric' | 'imperial' })}
          />
          <Switch
            label={t('show weather icon')}
            checked={state.weather.showIcon}
            onChange={(val) => actions.updateWeather({ showIcon: val })}
          />
          <Switch
            label={t('show weather text')}
            checked={state.weather.showText}
            onChange={(val) => actions.updateWeather({ showText: val })}
          />
          <Switch
            label={t('show city')}
            checked={state.weather.showCity ?? true}
            onChange={(val) => actions.updateWeather({ showCity: val })}
          />
          <Switch
            label={t('show feels like')}
            checked={state.weather.showFeelsLike ?? false}
            onChange={(val) => actions.updateWeather({ showFeelsLike: val })}
          />
          <Switch
            label={t('show min max')}
            checked={state.weather.showMinMax ?? false}
            onChange={(val) => actions.updateWeather({ showMinMax: val })}
          />
          <Switch
            label={t('show humidity')}
            checked={state.weather.showHumidity ?? false}
            onChange={(val) => actions.updateWeather({ showHumidity: val })}
          />
          <Switch
            label={t('show wind')}
            checked={state.weather.showWind ?? false}
            onChange={(val) => actions.updateWeather({ showWind: val })}
          />
        </CategorySection>
      </Show>

      <Show when={state.layout.showSearchbar}>
        <CategorySection title={t('search')} helpLink={getHelpLink(helpLinks.search)}>
          <Select
            label={t('search engine')}
            value={state.search.engine}
            options={props.searchEngineOptions}
            onChange={(val) => actions.updateSearch({ engine: val })}
          />
          <Switch
            label={t('auto focus')}
            checked={state.search.focus}
            onChange={(val) => actions.updateSearch({ focus: val })}
          />
          <Switch
            label={t('new tab')}
            checked={state.search.newTab}
            onChange={(val) => actions.updateSearch({ newTab: val })}
          />
        </CategorySection>
      </Show>

      <Show when={state.layout.showShortcuts}>
        <CategorySection title={t('shortcuts')} helpLink={getHelpLink(helpLinks.shortcut)}>
          <Select
            label={t('style')}
            value={state.shortcutAppereance.style}
            options={props.shortcutStyleOptions}
            onChange={(val) => actions.updateShortcutAppearance({ style: val as ShortcutStyle })}
          />
          <Slider
            label={t('columns')}
            min={1}
            max={10}
            showValue
            value={state.shortcutAppereance.elementsPerLine ?? state.shortcutAppereance.col ?? 4}
            onChange={(elementsPerLine) =>
              actions.updateShortcutAppearance({ elementsPerLine, col: elementsPerLine })
            }
          />
          <Switch
            label={t('icon only')}
            checked={state.shortcutAppereance.iconOnly}
            onChange={(val) => actions.updateShortcutAppearance({ iconOnly: val })}
          />

          <div class="pt-3 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t('new shortcut')}
            </span>
            <Input
              label={t('shortcut name')}
              value={newShortcutName()}
              onInput={(e) => setNewShortcutName(e.currentTarget.value)}
            />
            <Input
              label={t('shortcut link')}
              value={newShortcutLink()}
              onInput={(e) => setNewShortcutLink(e.currentTarget.value)}
            />
            <Input
              label={t('shortcut icon')}
              value={newShortcutIcon()}
              placeholder="https://... (optional)"
              onInput={(e) => setNewShortcutIcon(e.currentTarget.value)}
            />
            <IconUpload onIcon={setNewShortcutIcon} />
            <Switch
              label={t('new tab')}
              checked={newShortcutNewTab()}
              onChange={setNewShortcutNewTab}
            />
            <Button
              variant="default"
              size="sm"
              class="w-full mt-1"
              disabled={!newShortcutName().trim() || !newShortcutLink().trim()}
              onClick={handleAddShortcut}
            >
              {t('add')}
            </Button>
          </div>
        </CategorySection>
      </Show>
    </div>
  );
};
