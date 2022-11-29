import { Component, createEffect, createSignal, Show } from 'solid-js';
import { Setting, ShortcutSetting } from '../../types/settings.js';
import SettingContent from './settings.jsx';

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
      <span
        class={`text-gray-400 dark:text-gray-100 i-mdi-cog transition hover:text-orange-200 group absolute right-2 bottom-2 z-40 p-3 cursor-pointer rounded-full transition duration-300 hover:rotate-45 ${
          showSetting() ? 'bg-gray' : null
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
      <Show when={showSetting()}>
        <div class='absolute top-0 left-0 w-screen h-screen backdrop-brightness-50'></div>
      </Show>
      <aside
        ref={settingPanel!}
        class={`absolute right-0 top-0 h-full max-w-1/3 surface-base transition duration-300 z-30 overflow-y-auto ${
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
