import { Switch as KobalteSwitch } from '@kobalte/core/switch';
import { Show, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';

export interface SwitchProps {
  id?: string;
  label?: string;
  description?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  class?: string;
}

export function Switch(props: SwitchProps) {
  const [local, others] = splitProps(props, [
    'id',
    'label',
    'description',
    'checked',
    'onChange',
    'disabled',
    'class',
  ]);

  return (
    <KobalteSwitch
      id={local.id}
      class={cn('flex items-center justify-between w-full min-w-0 py-1', local.class)}
      checked={local.checked ?? false}
      onChange={local.onChange}
      disabled={local.disabled}
      {...others}
    >
      <div class="flex flex-col gap-0.5 flex-1 min-w-0 pr-3">
        <Show when={local.label}>
          <KobalteSwitch.Label class="text-xs sm:text-sm font-medium text-[var(--fg-label)] cursor-pointer select-none truncate">
            {local.label}
          </KobalteSwitch.Label>
        </Show>
        <Show when={local.description}>
          <KobalteSwitch.Description class="text-xs text-[var(--fg-faint)] truncate">
            {local.description}
          </KobalteSwitch.Description>
        </Show>
      </div>

      <KobalteSwitch.Input class="sr-only" />
      <KobalteSwitch.Control
        class={cn(
          'inline-flex shrink-0 items-center w-9 h-5 p-0.5 rounded-full border-none outline-none transition-colors cursor-pointer',
          'focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
          local.checked ? 'bg-[var(--primary)]' : 'bg-[var(--switch-off)]',
        )}
      >
        <KobalteSwitch.Thumb
          class={cn(
            'w-4 h-4 rounded-full bg-[var(--thumb)] shadow-md transition-transform duration-200 block',
            local.checked ? 'translate-x-4' : 'translate-x-0',
          )}
        />
      </KobalteSwitch.Control>
    </KobalteSwitch>
  );
}
