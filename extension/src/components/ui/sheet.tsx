import { splitProps } from 'solid-js';
import type { Component, JSX } from 'solid-js';
import { Dialog as KobalteDialog } from '@kobalte/core/dialog';

import { cn } from '../../lib/utils';

interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: JSX.Element;
  id?: string;
  modal?: boolean;
  preventScroll?: boolean;
  forceMount?: boolean;
}

interface SheetContentProps {
  class?: string;
  children: JSX.Element;
  ref?: HTMLElement | ((el: HTMLElement) => void);
  onPointerDownOutside?: (e: Event) => void;
  onInteractOutside?: (e: Event) => void;
}

interface SheetOverlayProps {
  class?: string;
}

interface SheetHeaderProps {
  class?: string;
  children: JSX.Element;
}

interface SheetTitleProps {
  class?: string;
  children: JSX.Element;
}

interface SheetCloseButtonProps {
  class?: string;
  children?: JSX.Element;
  'aria-label'?: string;
}

interface SheetTriggerProps {
  class?: string;
  children: JSX.Element;
  'aria-label'?: string;
}

const SheetRoot: Component<SheetProps> = (props) => (
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
  ),
  SheetTrigger: Component<SheetTriggerProps> = (props) => {
    const [local, others] = splitProps(props, ['class', 'children']);
    return (
      <KobalteDialog.Trigger class={local.class} {...others}>
        {local.children}
      </KobalteDialog.Trigger>
    );
  },
  SheetOverlay: Component<SheetOverlayProps> = (props) => (
    <KobalteDialog.Overlay class={cn('sidebar-overlay', props.class)} />
  ),
  SheetContent: Component<SheetContentProps> = (props) => {
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
  },
  SheetHeader: Component<SheetHeaderProps> = (props) => (
    <div
      class={cn(
        'sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-[var(--divider)] bg-[var(--surface-header)] backdrop-blur-xl transition-colors',
        props.class,
      )}
    >
      {props.children}
    </div>
  ),
  SheetTitle: Component<SheetTitleProps> = (props) => (
    <KobalteDialog.Title
      class={cn(
        'text-base font-semibold tracking-wider uppercase text-[var(--fg-strong)] m-0',
        props.class,
      )}
    >
      {props.children}
    </KobalteDialog.Title>
  ),
  SheetCloseButton: Component<SheetCloseButtonProps> = (props) => (
    <KobalteDialog.CloseButton
      class={cn(
        'p-1.5 rounded-lg text-[var(--fg-icon-muted)] hover:text-[var(--fg-label)] hover:bg-[var(--btn-icon-hover)] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] border-none bg-transparent',
        props.class,
      )}
      aria-label={props['aria-label'] ?? 'Close'}
    >
      {props.children ?? <span class="i-mdi-close text-xl block" aria-hidden="true" />}
    </KobalteDialog.CloseButton>
  ),
  Sheet = Object.assign(SheetRoot, {
    CloseButton: SheetCloseButton,
    Content: SheetContent,
    Description: KobalteDialog.Description,
    Header: SheetHeader,
    Overlay: SheetOverlay,
    Portal: KobalteDialog.Portal,
    Root: SheetRoot,
    Title: SheetTitle,
    Trigger: SheetTrigger,
  });

export {
  Sheet,
  type SheetCloseButtonProps,
  type SheetContentProps,
  type SheetHeaderProps,
  type SheetOverlayProps,
  type SheetProps,
  type SheetTitleProps,
  type SheetTriggerProps,
};
