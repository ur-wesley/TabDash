import { Tabs as KobalteTabs } from '@kobalte/core/tabs';
import { type Component, createSignal, For, type JSX, children } from 'solid-js';
import { cn } from '../../lib/utils.js';

export interface TabsProps {
  readonly activeTab?: number;
  readonly tabs: readonly string[];
  readonly children: JSX.Element;
  readonly onchange?: (tab: number) => void;
}

const Tabs: Component<TabsProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal(props.activeTab ?? 0);
  const resolvedChildren = children(() => props.children);

  return (
    <KobalteTabs
      class="flex flex-col gap-2"
      value={String(activeTab())}
      onChange={(val) => {
        const next = Number.parseInt(val, 10);
        setActiveTab(next);
        props.onchange?.(next);
      }}
    >
      <KobalteTabs.List class="surface-base p-2 flex text-center rounded-xl gap-1">
        <For each={props.tabs}>
          {(tab, index) => (
            <KobalteTabs.Trigger
              value={String(index())}
              class={cn(
                'p-1.5 rounded-lg grow w-full cursor-pointer text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                activeTab() === index()
                  ? 'text-white bg-blue-500 shadow-sm'
                  : 'text-blue-500 hover:bg-black/5 dark:hover:bg-white/5',
              )}
            >
              {tab}
            </KobalteTabs.Trigger>
          )}
        </For>
      </KobalteTabs.List>
      <div>
        {Array.isArray(resolvedChildren())
          ? (resolvedChildren() as JSX.Element[])[activeTab()]
          : resolvedChildren()}
      </div>
    </KobalteTabs>
  );
};

export default Tabs;
