import { Toaster as SonnerToaster, toast, useSonner } from 'solid-sonner';
import type { ToasterProps } from 'solid-sonner';

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classes: {
          actionButton:
            'bg-[var(--toast-action-bg)] text-[var(--toast-action-fg)] hover:bg-[var(--toast-action-hover)] text-xs px-2 py-1 rounded',
          cancelButton:
            'bg-[var(--toast-cancel-bg)] text-[var(--toast-cancel-fg)] hover:bg-[var(--toast-cancel-hover)] text-xs px-2 py-1 rounded',
          description: 'text-[var(--toast-fg-muted)] text-xs',
          error: 'border-[var(--toast-error-border)] text-[var(--toast-error-fg)]',
          info: 'border-[var(--toast-info-border)] text-[var(--toast-info-fg)]',
          success: 'border-[var(--toast-success-border)] text-[var(--toast-success-fg)]',
          toast:
            'bg-[var(--toast-bg)] border border-[var(--toast-border)] text-[var(--toast-fg)] shadow-xl rounded-lg font-sans',
          warning: 'border-[var(--toast-warning-border)] text-[var(--toast-warning-fg)]',
        },
      }}
      {...props}
    />
  );
}

export { toast, useSonner };
