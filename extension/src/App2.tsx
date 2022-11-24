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
import Settings from './api/settings.js';
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

const App: Component = () => {
  const [theme, setTheme] = createSignal<Theme>();
  const [settings, { mutate }] = createResource(
    { init: 'init', sync: false },
    Settings.getSettings,
    {}
  );
  createEffect(async () => {
    setTheme(settings()?.settings.general.theme);
    setFavicon();
  });
  const setFavicon = async () => {
    const file =
      import.meta.env.VITE_IS_EXTENSION == 'true'
        ? chrome.runtime.getURL('logo.svg')
        : '/logo.svg';
    const favicon = settings()?.settings.general.favicon || file;
    const faviconEl = document.getElementById('favicon')! as HTMLLinkElement;
    faviconEl.href = favicon!;
    document.title = settings()?.settings.general.title || 'TabDash';
  };
  return (
    <Show when={settings.state == 'ready'}>
      <NotificationList />
      <div
        style={{
          background:
            !settings()!.settings.background.active &&
            !settings()!.settings.background.static
              ? settings()!.settings.background.color
              : undefined,
          'background-image': settings()!.settings.background.active
            ? `url('${settings()!.settings.background.image.src}')`
            : settings()!.settings.background.static
            ? `url('${settings()!.settings.background.static}')`
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
              (settings()!.settings.layout.showClock ||
                settings()!.settings.layout.showDate) ??
              false
            }
          >
            <Clock
              locale={settings()!.settings.general.locale ?? 'en'}
              settings={settings()!.settings.clock}
              showDate={settings()?.settings.layout.showDate}
              showTime={settings()?.settings.layout.showClock}
            />
          </Show>
          <Show when={settings()!.settings.background.backdropActive ?? false}>
            <Backdrop
              blur={settings()!.settings.background.backdrop.blur ?? '0px'}
              brightness={
                settings()!.settings.background.backdrop.brightness ?? '100%'
              }
              saturate={
                settings()!.settings.background.backdrop.saturate ?? '100%'
              }
            />
          </Show>
          <Show when={settings()!.settings.layout.showGreeting ?? false}>
            <Greeting
              name={settings()!.settings.general.username}
              locale={settings()!.settings.general.locale as AvailableLanguages}
            />
          </Show>
          <Show when={settings()!.settings.layout.showWeather ?? false}>
            <Suspense>
              <WeatherWidget
                setting={settings()!.settings.weather}
                data={settings()!.weatherData!}
              />
            </Suspense>
          </Show>
          <Show when={settings()!.settings.layout.showSearchbar ?? false}>
            <Searchbar lang={settings()!.settings.general.locale} />
          </Show>
          <Show when={settings()!.settings.layout.showShortcuts ?? false}>
            <div
              style={{
                display: 'flex',
                'justify-content': 'center',
                gap: '.75rem',
                'flex-wrap': 'wrap',
              }}
            >
              <For each={settings()!.settings.shortcuts} fallback=''>
                {(shortcut, index) => (
                  <Shortcut
                    settings={shortcut}
                    // col={Math.floor(
                    //   index() /
                    //     settings()!.settings.shortcutAppereance.elementsPerLine
                    // )}
                    col={
                      100 /
                        settings()!.settings.shortcutAppereance
                          .elementsPerLine -
                      5
                    }
                    locale={
                      settings()!.settings.general.locale as AvailableLanguages
                    }
                    style={settings()!.settings.shortcutAppereance}
                    onEdit={async (s) => {
                      settings()!.editShortcut(index(), s);
                      mutate(
                        await Settings.getSettings({
                          refresh: 'init',
                          sync: false,
                        })
                      );
                    }}
                    onRemove={async (s) => {
                      if (
                        confirm(
                          messages['confirm delete'][
                            settings()!.settings.general
                              .locale as AvailableLanguages
                          ]
                        )
                      ) {
                        settings()!.removeShortcut(s);
                        mutate(
                          await Settings.getSettings({
                            refresh: 'init',
                            sync: false,
                          })
                        );
                      }
                    }}
                  />
                )}
              </For>
            </div>
          </Show>
        </div>
        <Show when={settings()!.settings.background.active}>
          <Author information={settings()!.settings.background.image} />
        </Show>
        <ThemeToggle
          update={(t: Theme) => {
            settings()!.setTheme(t);
            setTheme(t);
          }}
          theme={theme()!}
        />
        <SettingToggle
          settings={settings()!.settings}
          onUpdate={async (s) => {
            settings()!.settings = s;
            settings()!.save();
            mutate(
              await Settings.getSettings({
                refresh: 'init',
                sync: settings()?.settings.general.sync,
              })
            );
            setFavicon();
          }}
          addShortcut={async (shortcut) => {
            settings()!.addShortcut(shortcut);
            mutate(
              await Settings.getSettings({
                refresh: 'init',
                sync: settings()?.settings.general.sync,
              })
            );
          }}
          onRefreshImage={async () => {
            await settings()!.refreshImage();
            mutate(
              await Settings.getSettings({
                refresh: 'init',
                sync: settings()?.settings.general.sync,
              })
            );
          }}
          onWeatherUpdate={async () => {
            mutate(
              await Settings.getSettings({
                refresh: 'refresh',
                sync: settings()!.settings.general.sync,
              })
            );
          }}
        />
      </div>
    </Show>
  );
};

export default App;
