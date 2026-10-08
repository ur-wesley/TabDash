import { Toaster as SonnerToaster, type ToasterProps, toast, useSonner } from 'solid-sonner';

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classes: {
          toast:
            'bg-[var(--toast-bg)] border border-[var(--toast-border)] text-[var(--toast-fg)] shadow-xl rounded-lg font-sans',
          description: 'text-[var(--toast-fg-muted)] text-xs',
          actionButton:
            'bg-[var(--toast-action-bg)] text-[var(--toast-action-fg)] hover:bg-[var(--toast-action-hover)] text-xs px-2 py-1 rounded',
          cancelButton:
            'bg-[var(--toast-cancel-bg)] text-[var(--toast-cancel-fg)] hover:bg-[var(--toast-cancel-hover)] text-xs px-2 py-1 rounded',
          error: 'border-[var(--toast-error-border)] text-[var(--toast-error-fg)]',
          success: 'border-[var(--toast-success-border)] text-[var(--toast-success-fg)]',
          warning: 'border-[var(--toast-warning-border)] text-[var(--toast-warning-fg)]',
          info: 'border-[var(--toast-info-border)] text-[var(--toast-info-fg)]',
        },
      }}
      {...props}
    />
  );
}

export { toast, useSonner };
