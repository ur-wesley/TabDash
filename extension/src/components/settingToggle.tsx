import {
  Component,
  createEffect,
  createSignal,
  onMount,
  onCleanup,
  Show,
} from 'solid-js';
import { Setting, ShortcutSetting } from '../../types/settings.js';
import SettingContent from './settingContent.jsx';

const SettingToggle: Component<Prop> = (props) => {
  let settingPanel: HTMLElement;
  const [showSetting, setShowSetting] = createSignal(false);
  onMount(() =>
    window.addEventListener(
      'resize',
      () => (settingPanel.style.height = '100%')
    )
  );
  onCleanup(() =>
    window.removeEventListener(
      'resize',
      () => (settingPanel.style.height = '100%')
    )
  );
  createEffect(() => {
    startHeight = settingPanel.clientHeight;
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node;
      if (!settingPanel || t.nodeName == 'SPAN') return;
      if (settingPanel && !settingPanel.contains(event.target as Node)) {
        animateWidgets();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });
  let startHeight = 0;
  let menuClicked = false;
  const clickstart = (e: PointerEvent) => {
    menuClicked = true;
    settingPanel.style.height = settingPanel.clientHeight + 'px';
    settingPanel.classList.remove('h-full');
  };
  const clickend = (e: PointerEvent) => {
    menuClicked = false;
    settingPanel.classList.add('h-full');
  };
  const clickmove = (e: PointerEvent) => {
    if (!menuClicked) return;
    const height = startHeight - e.clientY;
    if (height < 300 || height >= startHeight) return;
    settingPanel.style.height = `${height}px`;
  };

  const animateWidgets = () => {
    setShowSetting(!showSetting());
    const el = document.getElementById('content');
    if (showSetting()) {
      el!.classList.add(
        '-translate-y-15',
        'md:-translate-y-0',
        'md:-translate-x-15'
      );
      el!.style.transition = 'all 300ms';
    } else
      el!.classList.remove(
        '-translate-y-15',
        'md:-translate-y-0',
        'md:-translate-x-15'
      );
  };

  return (
    <>
      <div
        class={`z-40 widget absolute right-2 bottom-2 grid place-content-center overflow-hidden p-1`}
      >
        <span
          class={`i-mdi-cog transition cursor-pointer p-3 transition ease-in-out duration-300 bg-gray-800 dark:bg-gray-200 outline-transparent border-red ${
            showSetting() ? 'rotate-45' : 'hover:rotate-12'
          }`}
          onClick={animateWidgets}
        />
      </div>
      <Show when={showSetting()}>
        <div class='absolute top-0 left-0 w-screen h-screen backdrop-brightness-80'></div>
      </Show>
      <aside
        ref={settingPanel!}
        class={`absolute right-0 bottom-0 md:top-0 h-full w-full md:w-100 max-w-full md:max-w-1/2 surface-base transition duration-300 z-30 overflow-y-auto ${
          !showSetting()
            ? 'translate-y-full md:translate-y-0 md:translate-x-full'
            : ''
        }`}
        onpointermove={clickmove}
        onpointerleave={clickend}
        onpointerup={clickend}
      >
        <Show when={showSetting()}>
          <div
            class='sticky top-0 md:hidden h-12 w-full z-40 bg-blue/60 dark:bg-blue/40 cursor-row-resize grid place-content-center'
            onpointerdown={clickstart}
          >
            <div class='i-mdi-arrow-split-horizontal bg-white dark:bg-black'></div>
          </div>
        </Show>
        <SettingContent
          settings={props.settings}
          addShortcut={props.addShortcut}
          onRefreshImage={props.onRefreshImage}
          onWeatherUpdate={props.onWeatherUpdate}
        />
      </aside>
    </>
  );
};

export default SettingToggle;

interface Prop {
  settings: Setting;
  addShortcut: (shortcut: ShortcutSetting) => void;
  onRefreshImage: () => void;
  onWeatherUpdate: () => void;
}
