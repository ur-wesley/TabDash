import { type ComponentProps, Show, createUniqueId, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';

export interface InputProps extends ComponentProps<'input'> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClass?: string;
}

export function Input(props: InputProps) {
  const [local, others] = splitProps(props, [
    'class',
    'id',
    'label',
    'error',
    'helperText',
    'containerClass',
  ]);

  const id = () => local.id ?? `input-${createUniqueId()}`;

  return (
    <div class={cn('flex flex-col gap-1 w-full min-w-0 py-0.5', local.containerClass)}>
      <Show when={local.label}>
        <label
          for={id()}
          class="text-xs sm:text-sm font-medium text-[var(--fg-label)] truncate"
        >
          {local.label}
        </label>
      </Show>
      <input
        id={id()}
        class={cn(
          'flex h-8 w-full min-w-0 rounded-lg border border-[var(--border-field)] bg-[var(--field)] px-2.5 py-1 text-xs sm:text-sm text-[var(--fg-strong)] placeholder:text-[var(--fg-placeholder)] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50',
          local.error && 'border-[var(--border-error)] focus-visible:ring-[var(--ring-error)]',
          local.class,
        )}
        aria-invalid={!!local.error}
        aria-describedby={local.error ? `${id()}-error` : undefined}
        {...others}
      />
      <Show when={local.error}>
        <p id={`${id()}-error`} class="text-xs text-[var(--fg-error)]">
          {local.error}
        </p>
      </Show>
      <Show when={!local.error && local.helperText}>
        <p class="text-xs text-[var(--fg-faint)]">{local.helperText}</p>
      </Show>
    </div>
  );
}
