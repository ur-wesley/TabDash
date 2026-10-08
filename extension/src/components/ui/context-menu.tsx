import { ContextMenu as KobalteContextMenu } from '@kobalte/core/context-menu';
import { useMenuContext } from '@kobalte/core/menu';
import { type Component, type JSX, type ValidComponent, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';

export interface ContextMenuProps {
  onOpenChange?: (open: boolean) => void;
  children: JSX.Element;
  id?: string;
  modal?: boolean;
}

export interface ContextMenuContentProps {
  class?: string;
  children: JSX.Element;
  style?: JSX.CSSProperties | string;
}

const ContextMenuRoot: Component<ContextMenuProps> = (props) => {
  return (
    <KobalteContextMenu
      onOpenChange={props.onOpenChange}
      id={props.id}
      modal={props.modal ?? false}
    >
      {props.children}
    </KobalteContextMenu>
  );
};

const ContextMenuTrigger: Component<
  JSX.HTMLAttributes<HTMLElement> & {
    class?: string;
    children: JSX.Element;
    disabled?: boolean;
    'aria-label'?: string;
    as?: ValidComponent;
    href?: string;
    target?: string;
    style?: JSX.CSSProperties | string;
    onContextMenu?: (e: MouseEvent) => void;
  }
> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <KobalteContextMenu.Trigger class={local.class} {...others}>
      {local.children}
    </KobalteContextMenu.Trigger>
  );
};

const ContextMenuContent: Component<ContextMenuContentProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <KobalteContextMenu.Portal>
      <KobalteContextMenu.Content
        class={cn(
          'z-50 w-72 max-h-[70vh] overflow-y-auto rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-overlay)] backdrop-blur-2xl backdrop-saturate-150 px-2 py-1.5 text-[var(--fg-default)] shadow-2xl outline-none',
          'flex flex-col gap-1',
          'animate-in fade-in-0 zoom-in-95',
          local.class,
        )}
        {...others}
      >
        {local.children}
      </KobalteContextMenu.Content>
    </KobalteContextMenu.Portal>
  );
};

const ContextMenuHeader: Component<{
  title: string;
  closeLabel?: string;
  class?: string;
}> = (props) => {
  return (
    <header
      class={cn(
        'flex items-center justify-between gap-2 border-b border-[var(--divider)] pb-1',
        props.class,
      )}
    >
      <h2 class="truncate text-xs font-semibold uppercase tracking-wider text-[var(--fg-faint)]">
        {props.title}
      </h2>
      <ContextMenuCloseButton aria-label={props.closeLabel} />
    </header>
  );
};

const ContextMenuCloseButton: Component<{
  class?: string;
  children?: JSX.Element;
  'aria-label'?: string;
}> = (props) => {
  const menu = useMenuContext();
  return (
    <button
      type="button"
      onClick={() => menu.close()}
      class={cn(
        'text-[var(--fg-faint)] hover:text-[var(--fg-default)] p-1 rounded cursor-pointer bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        props.class,
      )}
      aria-label={props['aria-label'] ?? 'Close'}
    >
      {props.children ?? <span class="i-mdi-close text-base block" aria-hidden="true" />}
    </button>
  );
};

export const ContextMenu = Object.assign(ContextMenuRoot, {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Portal: KobalteContextMenu.Portal,
  Content: ContextMenuContent,
  Header: ContextMenuHeader,
  CloseButton: ContextMenuCloseButton,
});
