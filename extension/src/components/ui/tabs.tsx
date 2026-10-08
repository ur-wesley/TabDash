import { Tabs as KobalteTabs } from '@kobalte/core/tabs';
import { type Component, type JSX, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';

export interface TabsRootProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  class?: string;
  children: JSX.Element;
}

const TabsRoot: Component<TabsRootProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <KobalteTabs class={cn('w-full flex flex-col gap-3', local.class)} {...others}>
      {local.children}
    </KobalteTabs>
  );
};

const TabsList: Component<{ class?: string; children: JSX.Element }> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children']);
  const isGrid = () => local.class?.includes('grid');
  return (
    <KobalteTabs.List
      class={cn(
        'relative w-full rounded-xl border border-[var(--tab-list-border)] bg-[var(--tab-list-bg)] p-1 text-[var(--tab-fg-idle)] shadow-inner backdrop-blur-md transition-colors',
        !isGrid() && 'flex items-center justify-center',
        local.class,
      )}
      {...others}
    >
      {local.children}
    </KobalteTabs.List>
  );
};

const TabsTrigger: Component<{
  value: string;
  class?: string;
  children: JSX.Element;
  disabled?: boolean;
}> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <KobalteTabs.Trigger
      class={cn(
        'tabs-trigger relative z-10 inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-soft)] disabled:pointer-events-none disabled:opacity-50 flex-1 select-none',
        'text-[var(--tab-fg-idle)] hover:text-[var(--fg-strong)] hover:bg-[var(--tab-hover-wash)]',
        local.class,
      )}
      {...others}
    >
      {local.children}
    </KobalteTabs.Trigger>
  );
};

const TabsContent: Component<{ value: string; class?: string; children: JSX.Element }> = (
  props,
) => {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <KobalteTabs.Content
      class={cn(
        'w-full min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-md outline-none tab-content-animate',
        local.class,
      )}
      {...others}
    >
      {local.children}
    </KobalteTabs.Content>
  );
};

export const TabsIndicator: Component<{ class?: string }> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return (
    <KobalteTabs.Indicator
      class={cn(
        'absolute left-0 top-1 bottom-1 rounded-lg bg-[var(--tab-selected-bg)] shadow-sm border border-[var(--tab-indicator-border)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 pointer-events-none data-[resizing=true]:transition-none',
        local.class,
      )}
      {...others}
    />
  );
};

export const Tabs = Object.assign(TabsRoot, {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
  Indicator: TabsIndicator,
});
