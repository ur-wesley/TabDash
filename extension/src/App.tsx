import {
  Component,
  createEffect,
  createResource,
  createSignal,
  For,
  lazy,
  Show,
  Suspense,
} from 'solid-js';
import { Theme } from '../types/settings.js';
import NotificationList from './components/notificationList.jsx';
import { AvailableLanguages, messages } from './lang.js';
const Backdrop = lazy(() => import('./components/widgets/backdrop.jsx'));
const Clock = lazy(() => import('./components/widgets/clock.jsx'));
const Greeting = lazy(() => import('./components/widgets/greeting.jsx'));
const Searchbar = lazy(() => import('./components/widgets/searchbar.jsx'));
const SettingToggle = lazy(() => import('./components/settingToggle.jsx'));
const ThemeToggle = lazy(() => import('./components/themeToggle.jsx'));
const WeatherWidget = lazy(() => import('./components/widgets/weather.jsx'));
const Author = lazy(() => import('./components/widgets/author.jsx'));
const Shortcut = lazy(() => import('./components/widgets/shortcut.jsx'));

// import createSettings from './createSettings.jsx';
import {
  addShortcut,
  editShortcut,
  getSettings,
  refreshImage,
  removeShortcut,
  settingStore,
  weatherStore,
} from './api/settingStore';
import { useStore } from '@nanostores/solid';

const App: Component = () => {
  const $store = useStore(settingStore);
  const $weather = useStore(weatherStore);
  const [theme, setTheme] = createSignal<Theme>();
  createEffect(async () => {
    if ($store().general) {
      setTheme($store()?.general.theme ?? 'light');
      setFavicon();
    }
  });
  const setFavicon = async () => {
    const file =
      import.meta.env.VITE_IS_EXTENSION == 'true'
        ? chrome.runtime.getURL('favicon.png')
        : '/favicon.png';
    const favicon = $store()?.general.favicon || file;
    const faviconEl = document.getElementById('favicon')! as HTMLLinkElement;
    faviconEl.href = favicon!;
    document.title = $store()?.general.title || 'TabDash';
  };
  return (
    <Show when={!!$store().general}>
      <NotificationList />
      <div
        style={{
          background:
            !$store()!.background.active && !$store()!.background.static
              ? $store()!.background.color
              : undefined,
          'background-image': $store()!.background.active
            ? `url('${$store()!.background.image.src}')`
            : $store()!.background.static
            ? `url('${$store()!.background.static}')`
            : undefined,
          'background-size': 'cover',
          'background-position': 'center',
        }}
        class='m-0 h-screen w-screen overflow-hidden transition'
      >
        <div
          class='h-full w-full flex flex-col items-center p-4 justify-evenly overflow-hidden'
          id='content'
        >
          <Show
            when={
              ($store()!.layout.showClock || $store()!.layout.showDate) ?? false
            }
          >
            <Clock
              locale={$store()!.general.locale ?? 'en'}
              settings={$store()!.clock}
              showDate={$store()?.layout.showDate}
              showTime={$store()?.layout.showClock}
            />
          </Show>
          <Show when={$store()!.background.backdropActive ?? false}>
            <Backdrop
              blur={$store()!.background.backdrop.blur ?? '0px'}
              brightness={$store()!.background.backdrop.brightness ?? '100%'}
              saturate={$store()!.background.backdrop.saturate ?? '100%'}
            />
          </Show>
          <Show when={$store()!.layout.showGreeting ?? false}>
            <Greeting
              name={$store()!.general.username}
              locale={$store()!.general.locale as AvailableLanguages}
            />
          </Show>
          <Show when={$store()!.layout.showWeather ?? false}>
            <Suspense>
              <WeatherWidget setting={$store()!.weather} data={$weather()} />
            </Suspense>
          </Show>
          <Show when={$store()!.layout.showSearchbar ?? false}>
            <Searchbar lang={$store()!.general.locale} />
          </Show>
          <Show when={$store()!.layout.showShortcuts ?? false}>
            <div
              style={{
                display: 'flex',
                'justify-content': 'center',
                gap: '.75rem',
                'flex-wrap': 'wrap',
              }}
            >
              <For each={$store()!.shortcuts} fallback=''>
                {(shortcut, index) => (
                  <Shortcut
                    settings={shortcut}
                    col={100 / $store()!.shortcutAppereance.elementsPerLine - 5}
                    locale={$store()!.general.locale as AvailableLanguages}
                    style={$store()!.shortcutAppereance}
                    onEdit={async (s) => {
                      editShortcut(index(), s);
                    }}
                    onRemove={async (s) => {
                      if (
                        confirm(
                          messages['confirm delete'][
                            $store()!.general.locale as AvailableLanguages
                          ]
                        )
                      ) {
                        removeShortcut(s);
                      }
                    }}
                  />
                )}
              </For>
            </div>
          </Show>
        </div>
        <Show when={$store()!.background.active}>
          <Author
            information={$store()!.background.image}
            locale={$store()!.general.locale as AvailableLanguages}
          />
        </Show>
        <ThemeToggle
          update={(t: Theme) => {
            setTheme(t);
            setTheme(t);
          }}
          theme={theme()!}
        />
        <SettingToggle
          settings={$store()!}
          addShortcut={async (shortcut) => {
            addShortcut(shortcut);
          }}
          onRefreshImage={async () => {
            console.log('refreshing image');
            await refreshImage();
          }}
          onWeatherUpdate={async () => {
            await getSettings({
              refresh: 'refresh',
              sync: $store()?.general.sync ?? false,
            });
          }}
        />
      </div>
    </Show>
  );
};

export default App;
