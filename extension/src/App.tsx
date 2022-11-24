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

import createSettings from './createSettings.jsx';

const App: Component = () => {
  const [theme, setTheme] = createSignal<Theme>();
  // const [settings, { mutate }] = createResource(
  //   { init: 'init', sync: false },
  //   Settings.getSettings,
  //   {}
  // );
  createEffect(async () => {
    setTheme(createSettings.state.settings?.general.theme);
    setFavicon();
    if (createSettings.state.settings?.background.active)
      createSettings.state.settings.background.image =
        await createSettings.getImage();
  });
  const setFavicon = async () => {
    const file =
      import.meta.env.VITE_IS_EXTENSION == 'true'
        ? chrome.runtime.getURL('logo.svg')
        : '/logo.svg';
    const favicon = createSettings.state.settings?.general.favicon || file;
    const faviconEl = document.getElementById('favicon')! as HTMLLinkElement;
    faviconEl.href = favicon!;
    document.title = createSettings.state.settings?.general.title || 'TabDash';
  };
  return (
    <Show when={createSettings.state.settings}>
      <div class='absolute top-1/2 bg-green-200'>
        {JSON.stringify(createSettings.state.settings!.background)}
      </div>
      <NotificationList />
      <div
        style={{
          background:
            !createSettings.state.settings!.background.active &&
            !createSettings.state.settings!.background.static
              ? createSettings.state.settings!.background.color
              : undefined,
          'background-image': createSettings.state.settings!.background.active
            ? `url('${createSettings.state.settings!.background.image.src}')`
            : createSettings.state.settings!.background.static
            ? `url('${createSettings.state.settings!.background.static}')`
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
              (createSettings.state.settings!.layout.showClock ||
                createSettings.state.settings!.layout.showDate) ??
              false
            }
          >
            <Clock
              locale={createSettings.state.settings!.general.locale ?? 'en'}
              settings={createSettings.state.settings!.clock}
              showDate={createSettings.state.settings?.layout.showDate}
              showTime={createSettings.state.settings?.layout.showClock}
            />
          </Show>
          <Show
            when={
              createSettings.state.settings!.background.backdropActive ?? false
            }
          >
            <Backdrop
              blur={
                createSettings.state.settings!.background.backdrop.blur ?? '0px'
              }
              brightness={
                createSettings.state.settings!.background.backdrop.brightness ??
                '100%'
              }
              saturate={
                createSettings.state.settings!.background.backdrop.saturate ??
                '100%'
              }
            />
          </Show>
          <Show
            when={createSettings.state.settings!.layout.showGreeting ?? false}
          >
            <Greeting
              name={createSettings.state.settings!.general.username}
              locale={
                createSettings.state.settings!.general
                  .locale as AvailableLanguages
              }
            />
          </Show>
          {/* <Show
            when={
              createSettings.state?.settings?.settings.layout.showGreeting ??
              false
            }
          >
            <Greeting
              name={
                createSettings.state?.settings?.settings.general.username ?? ''
              }
              locale={
                createSettings.state?.settings?.settings.general
                  .locale as AvailableLanguages
              }
            />
          </Show> */}
          <Show
            when={createSettings.state.settings!.layout.showWeather ?? false}
          >
            <Suspense>
              <WeatherWidget
                setting={createSettings.state.settings!.weather}
                data={createSettings.state.weatherData!}
              />
            </Suspense>
          </Show>
          <Show
            when={createSettings.state.settings!.layout.showSearchbar ?? false}
          >
            <Searchbar lang={createSettings.state.settings!.general.locale} />
          </Show>
          <Show
            when={createSettings.state.settings!.layout.showShortcuts ?? false}
          >
            <div
              style={{
                display: 'flex',
                'justify-content': 'center',
                gap: '.75rem',
                'flex-wrap': 'wrap',
              }}
            >
              <For each={createSettings.state.settings!.shortcuts} fallback=''>
                {(shortcut, index) => (
                  <Shortcut
                    settings={shortcut}
                    // col={Math.floor(
                    //   index() /
                    //     createSettings.state.settings!.shortcutAppereance.elementsPerLine
                    // )}
                    col={
                      100 /
                        createSettings.state.settings!.shortcutAppereance
                          .elementsPerLine -
                      5
                    }
                    locale={
                      createSettings.state.settings!.general
                        .locale as AvailableLanguages
                    }
                    style={createSettings.state.settings!.shortcutAppereance}
                    onEdit={async (s) => {
                      createSettings.editShortcut(index(), s);
                      // mutate(
                      //   await Settings.getSettings({
                      //     refresh: 'init',
                      //     sync: false,
                      //   })
                      // );
                    }}
                    onRemove={async (s) => {
                      if (
                        confirm(
                          messages['confirm delete'][
                            createSettings.state.settings!.general
                              .locale as AvailableLanguages
                          ]
                        )
                      ) {
                        createSettings.removeShortcut(s);
                        // mutate(
                        //   await Settings.getSettings({
                        //     refresh: 'init',
                        //     sync: false,
                        //   })
                        // );
                      }
                    }}
                  />
                )}
              </For>
            </div>
          </Show>
        </div>
        <Show when={createSettings.state.settings!.background.active}>
          {/* <Author information={createSettings.state.settings!.background.image} /> */}
          <Author
            information={createSettings.state.settings!.background.image}
          />
        </Show>
        <ThemeToggle
          update={(t: Theme) => {
            createSettings.setTheme(t);
            setTheme(t);
          }}
          theme={theme()!}
        />
        <SettingToggle
          settings={createSettings.state.settings!}
          onUpdate={async (s) => {
            // createSettings.settings = s;
            // createSettings.save();
            createSettings.updateSettings(s);
            // mutate(
            //   await Settings.getSettings({
            //     refresh: 'init',
            //     sync: settings()?.settings.general.sync,
            //   })
            // );
            setFavicon();
          }}
          addShortcut={async (shortcut) => {
            createSettings.addShortcut(shortcut);
            // mutate(
            //   await Settings.getSettings({
            //     refresh: 'init',
            //     sync: settings()?.settings.general.sync,
            //   })
            // );
          }}
          onRefreshImage={async () => {
            await createSettings.refreshImage();
            // mutate(
            //   await Settings.getSettings({
            //     refresh: 'init',
            //     sync: settings()?.settings.general.sync,
            //   })
            // );
          }}
          onWeatherUpdate={async () => {
            // mutate(await Settings.getSettings('refresh'));
            await createSettings.getSettings({
              refresh: 'refresh',
              sync: createSettings.state.settings?.general.sync ?? false,
            });
          }}
        />
      </div>
    </Show>
  );
};

export default App;
