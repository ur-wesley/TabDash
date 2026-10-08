import { type Component, For } from 'solid-js';
import { useSettingsContext } from '../settings/settings-context';
import { ShortcutItem } from './shortcut-item';

export const ShortcutGrid: Component = () => {
  const [state, actions] = useSettingsContext();

  const shortcuts = () => state.shortcuts ?? [];
  const appearance = () => state.shortcutAppereance;
  const colCount = () => appearance()?.elementsPerLine ?? appearance()?.col ?? 4;
  const colPercent = () => (colCount() > 0 ? 100 / colCount() : 25);

  return (
    <div
      class="flex flex-wrap justify-center items-center gap-4 max-w-4xl mx-auto p-4 transition-all"
      style={{
        'max-width': `${Math.min(960, colCount() * 120 + 80)}px`,
      }}
    >
      <For each={shortcuts()}>
        {(shortcut, index) => (
          <ShortcutItem
            shortcut={shortcut}
            appearance={appearance()}
            colPercent={colPercent()}
            onEdit={(updated) => actions.editShortcut(index(), updated)}
            onRemove={() => actions.removeShortcut(shortcut)}
          />
        )}
      </For>
    </div>
  );
};
