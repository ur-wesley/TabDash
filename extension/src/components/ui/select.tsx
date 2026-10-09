import { Select as KobalteSelect } from '@kobalte/core/select';
import { Show, createUniqueId, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';

export interface SelectOption {
  readonly value: string;
  readonly name: string;
}

export interface SelectProps {
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  class?: string;
}

export function Select(props: SelectProps) {
  const [local, others] = splitProps(props, [
      'id',
      'label',
      'placeholder',
      'required',
      'value',
      'options',
      'onChange',
      'disabled',
      'class',
    ]),
    selectId = () => local.id ?? `select-${createUniqueId()}`,
    selectedOption = () => local.options.find((opt) => opt.value === local.value);

  return (
    <KobalteSelect<SelectOption>
      id={selectId()}
      class="w-full"
      options={local.options as SelectOption[]}
      optionValue="value"
      optionTextValue="name"
      placeholder={local.placeholder}
      value={selectedOption()}
      onChange={(item) => {
        if (item) {
          local.onChange(item.value);
        }
      }}
      disabled={local.disabled}
      required={local.required}
      itemComponent={(itemProps) => (
        <KobalteSelect.Item
          item={itemProps.item}
          class={cn(
            'select-item flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer outline-none select-none transition-colors text-left',
            'hover:bg-[var(--primary-wash)] focus:bg-[var(--primary-wash)] text-[var(--fg-default)]',
          )}
        >
          <KobalteSelect.ItemLabel class="text-left flex-1">
            {itemProps.item.rawValue.name}
          </KobalteSelect.ItemLabel>
          <KobalteSelect.ItemIndicator class="text-[var(--primary-fg)] font-bold ml-2">
            <span class="i-mdi-check text-base" aria-hidden="true" />
          </KobalteSelect.ItemIndicator>
        </KobalteSelect.Item>
      )}
    >
      <div class={cn('flex items-center justify-between gap-3 w-full min-w-0 py-1', local.class)}>
        <Show when={local.label}>
          <KobalteSelect.Label class="text-xs sm:text-sm font-medium text-[var(--fg-label)] min-w-0 flex-1 mr-2 truncate">
            {local.label}
          </KobalteSelect.Label>
        </Show>
        <KobalteSelect.HiddenSelect />
        <KobalteSelect.Trigger
          class={cn(
            'flex items-center justify-between rounded-md w-32 sm:w-40 max-w-[50%] px-2.5 py-1 text-xs sm:text-sm text-left transition shrink-0',
            'border border-[var(--border-field)] bg-[var(--field)] hover:bg-[var(--surface-hover)] text-[var(--fg-default)] shadow-sm',
            'outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          aria-label={local.label}
          {...others}
        >
          <span class="truncate flex-1">
            <KobalteSelect.Value<SelectOption>>
              {(state) => state.selectedOption()?.name ?? local.placeholder ?? ''}
            </KobalteSelect.Value>
          </span>
          <KobalteSelect.Icon class="ml-1.5 text-[var(--fg-icon-muted)] shrink-0">
            <span class="i-mdi-chevron-down text-base" aria-hidden="true" />
          </KobalteSelect.Icon>
        </KobalteSelect.Trigger>
      </div>

      <KobalteSelect.Portal>
        <KobalteSelect.Content class="z-50 min-w-44 sm:min-w-56 rounded-md border border-[var(--border-menu)] shadow-xl p-1 bg-[var(--surface)] text-left text-[var(--fg-default)] animate-in fade-in-80">
          <KobalteSelect.Listbox class="max-h-60 overflow-y-auto outline-none text-left p-0.5 space-y-0.5" />
        </KobalteSelect.Content>
      </KobalteSelect.Portal>
    </KobalteSelect>
  );
}
