import { Dialog as KobalteDialog } from '@kobalte/core/dialog';
import { type Component, type JSX, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: JSX.Element;
  id?: string;
  modal?: boolean;
  preventScroll?: boolean;
  forceMount?: boolean;
}

export interface SheetContentProps {
  class?: string;
  children: JSX.Element;
  ref?: HTMLElement | ((el: HTMLElement) => void);
  onPointerDownOutside?: (e: Event) => void;
  onInteractOutside?: (e: Event) => void;
}

export interface SheetOverlayProps {
  class?: string;
}

export interface SheetHeaderProps {
  class?: string;
  children: JSX.Element;
}

export interface SheetTitleProps {
  class?: string;
  children: JSX.Element;
}

export interface SheetCloseButtonProps {
  class?: string;
  children?: JSX.Element;
  'aria-label'?: string;
}

export interface SheetTriggerProps {
  class?: string;
  children: JSX.Element;
  'aria-label'?: string;
}

const SheetRoot: Component<SheetProps> = (props) => {
  return (
    <KobalteDialog
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      id={props.id}
      modal={props.modal ?? true}
      preventScroll={props.preventScroll}
      forceMount={props.forceMount}
    >
      {props.children}
    </KobalteDialog>
  );
};

const SheetTrigger: Component<SheetTriggerProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <KobalteDialog.Trigger class={local.class} {...others}>
      {local.children}
    </KobalteDialog.Trigger>
  );
};

const SheetOverlay: Component<SheetOverlayProps> = (props) => {
  return <KobalteDialog.Overlay class={cn('sidebar-overlay', props.class)} />;
};

const SheetContent: Component<SheetContentProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children', 'ref']);
  return (
    <KobalteDialog.Content
      as="aside"
      ref={local.ref}
      class={cn(
        'sidebar-content bg-[var(--surface-overlay)] border-l border-[var(--glass-border)] text-[var(--fg-default)] backdrop-blur-2xl backdrop-saturate-150 transition-colors shadow-2xl',
        local.class,
      )}
      {...others}
    >
      {local.children}
    </KobalteDialog.Content>
  );
};

const SheetHeader: Component<SheetHeaderProps> = (props) => {
  return (
    <div
      class={cn(
        'sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-[var(--divider)] bg-[var(--surface-header)] backdrop-blur-xl transition-colors',
        props.class,
      )}
    >
      {props.children}
    </div>
  );
};

const SheetTitle: Component<SheetTitleProps> = (props) => {
  return (
    <KobalteDialog.Title
      class={cn(
        'text-base font-semibold tracking-wider uppercase text-[var(--fg-strong)] m-0',
        props.class,
      )}
    >
      {props.children}
    </KobalteDialog.Title>
  );
};

const SheetCloseButton: Component<SheetCloseButtonProps> = (props) => {
  return (
    <KobalteDialog.CloseButton
      class={cn(
        'p-1.5 rounded-lg text-[var(--fg-icon-muted)] hover:text-[var(--fg-label)] hover:bg-[var(--btn-icon-hover)] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] border-none bg-transparent',
        props.class,
      )}
      aria-label={props['aria-label'] ?? 'Close'}
    >
      {props.children ?? <span class="i-mdi-close text-xl block" aria-hidden="true" />}
    </KobalteDialog.CloseButton>
  );
};

export const Sheet = Object.assign(SheetRoot, {
  Root: SheetRoot,
  Trigger: SheetTrigger,
  Portal: KobalteDialog.Portal,
  Overlay: SheetOverlay,
  Content: SheetContent,
  Header: SheetHeader,
  Title: SheetTitle,
  Description: KobalteDialog.Description,
  CloseButton: SheetCloseButton,
});
