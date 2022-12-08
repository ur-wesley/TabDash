import {
  Component,
  createEffect,
  createSignal,
  For,
  lazy,
  Match,
  Show,
  Suspense,
  Switch,
} from 'solid-js';
import { Theme } from '../types/settings.js';
import NotificationList from './components/notificationList.jsx';
import { AvailableLanguages, messages } from './lang.js';
const Backdrop = lazy(() => import('./components/widgets/backdrop.jsx'));
const Clock = lazy(() => import('./components/widgets/clock.jsx'));
const Greeting = lazy(() => import('./components/widgets/greeting.jsx'));
const Searchbar = lazy(() => import('./components/widgets/searchbar.jsx'));
const SettingToggle = lazy(() => import('./components/settingToggle.jsx'));
const WeatherWidget = lazy(() => import('./components/widgets/weather.jsx'));
const Author = lazy(() => import('./components/widgets/author.jsx'));
const Shortcut = lazy(() => import('./components/widgets/shortcut.jsx'));

import {
  addShortcut,
  editShortcut,
  refreshImage,
  refreshWeather,
  removeShortcut,
  settingStore,
  weatherStore,
} from './api/settingStore';
import { useStore } from '@nanostores/solid';

export const [locale, setLocale] = createSignal<AvailableLanguages>('en');

const App: Component = () => {
  const $store = useStore(settingStore);
  const $weather = useStore(weatherStore);

  const setTheme = () => {
    let mode: Theme = 'dark';
    let activeTheme: Theme = 'light';
    const theme = $store().general.theme;
    if (theme == 'automatic') {
      if ($weather().additional) {
        const now = Date.now();
        const t =
          now > $weather().additional.sunrise * 1000 &&
          now > $weather().additional.sunset * 1000
            ? 'dark'
            : 'light';
        mode = t == 'light' ? 'dark' : 'light';
        activeTheme = t;
      }
    }
    if (theme == 'system') {
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        mode = 'light';
        activeTheme = 'dark';
      }
    }
    if (theme == 'light' || theme == 'dark') {
      mode = theme == 'light' ? 'dark' : 'light';
      activeTheme = theme;
    }
    document.getElementsByTagName('html')[0].classList.remove(mode!);
    document.getElementsByTagName('html')[0].classList.add(activeTheme!);
  };

  createEffect(async () => {
    if ($store().general) {
      setTheme();
      setLocale($store().general.locale as AvailableLanguages);
      setFavicon();
      if ($store()!.background.active || $store()!.background.static) {
        const bgImg = document.querySelector(
          '#background'
        )! as HTMLImageElement;
        bgImg.src = $store()!.background.active
          ? $store()!.background.image.src
          : $store()!.background.static ?? '';
      } else {
        const bgDiv = document.querySelector('#background') as HTMLDivElement;
        bgDiv.style.background = $store().background.color ?? '';
      }
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
      <Switch
        fallback={
          <div
            id='background'
            class='h-screen w-screen overflow-hidden absolute top-0 left-0 transition'
          />
        }
      >
        <Match when={$store().background.active || $store().background.static}>
          <img
            alt='background image'
            id='background'
            class='h-screen w-screen overflow-hidden absolute top-0 left-0 transition object-cover'
          />
          <img src={$store().background.image.next} class='hidden' />
        </Match>
      </Switch>
      <div
        class='h-screen w-full flex flex-col items-center justify-evenly overflow-hidden'
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
          <Searchbar
            lang={$store()!.general.locale}
            settings={$store().search}
          />
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
      <SettingToggle
        settings={$store()!}
        addShortcut={async (shortcut) => {
          addShortcut(shortcut);
        }}
        onRefreshImage={async () => {
          await refreshImage();
        }}
        onWeatherUpdate={async () => {
          await refreshWeather();
        }}
      />
    </Show>
  );
};

export default App;
