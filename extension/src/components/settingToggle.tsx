import { Component, createEffect, createSignal, Show } from 'solid-js';
import { Setting, ShortcutSetting } from '../../types/settings.js';
import SettingContent from './settingContent.jsx';

const SettingToggle: Component<Prop> = (props) => {
  let settingPanel: HTMLElement;
  const [showSetting, setShowSetting] = createSignal(false);
  createEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node;
      if (!settingPanel || t.nodeName == 'SPAN') return;
      if (settingPanel && !settingPanel.contains(event.target as Node)) {
        setShowSetting(false);
        const el = document.getElementById('content');
        el!.style.transform = '';
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });
  return (
    <>
      <div class='z-40 widget absolute right-2 bottom-2 grid place-content-center overflow-hidden p-1'>
        <span
          class={`i-mdi-cog transition cursor-pointer p-4 transition ease-in-out duration-300 bg-gray-800 dark:bg-gray-200 outline-transparent border-red ${
            showSetting() ? 'rotate-90' : 'hover:rotate-12'
          }`}
          onClick={() => {
            setShowSetting(!showSetting());
            const el = document.getElementById('content');
            if (showSetting()) {
              el!.style.transform = 'translate(-10%,0)';
              el!.style.transition = 'all 300ms';
            } else el!.style.transform = '';
          }}
        />
      </div>
      <Show when={showSetting()}>
        <div class='absolute top-0 left-0 w-screen h-screen backdrop-brightness-80'></div>
      </Show>
      <aside
        ref={settingPanel!}
        class={`absolute right-0 top-0 h-full w-100 max-w-1/2 surface-base transition duration-300 z-30 overflow-y-auto ${
          !showSetting() ? 'translate-x-full' : ''
        }`}
      >
        <SettingContent
          settings={props.settings}
          addShortcut={(s) => props.addShortcut(s)}
          onRefreshImage={() => props.onRefreshImage()}
          onWeatherUpdate={() => props.onWeatherUpdate()}
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
