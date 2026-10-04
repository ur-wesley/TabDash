import { Select as KobalteSelect } from '@kobalte/core/select';
import { type Component, createUniqueId } from 'solid-js';
import { cn } from '../../lib/utils.js';

export interface SelectOption {
  readonly value: string;
  readonly name: string;
}

export interface SelectProps {
  readonly id?: string;
  readonly label: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly value?: string;
  readonly options: readonly SelectOption[];
  readonly onInput: (value: string) => void;
  readonly disabled?: boolean;
}

const Select: Component<SelectProps> = (props) => {
  const selectId = props.id ?? `select-${createUniqueId()}`;
  const selectedOption = () => props.options.find((opt) => opt.value === props.value);

  return (
    <KobalteSelect<SelectOption>
      id={selectId}
      options={props.options as SelectOption[]}
      optionValue="value"
      optionTextValue="name"
      placeholder={props.placeholder}
      value={selectedOption()}
      onChange={(item) => {
        if (item) {
          props.onInput(item.value);
        }
      }}
      disabled={props.disabled}
      required={props.required}
      itemComponent={(itemProps) => (
        <KobalteSelect.Item
          item={itemProps.item}
          class={cn(
            'flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer outline-none select-none transition-colors',
            'hover:bg-blue-500/10 focus:bg-blue-500/15 data-[highlighted]:bg-blue-500/15 dark:hover:bg-blue-500/20',
            'text-slate-800 dark:text-slate-100',
          )}
        >
          <KobalteSelect.ItemLabel>{itemProps.item.rawValue.name}</KobalteSelect.ItemLabel>
          <KobalteSelect.ItemIndicator class="text-blue-500 font-bold ml-2">
            ✓
          </KobalteSelect.ItemIndicator>
        </KobalteSelect.Item>
      )}
    >
      <div class="flex items-center justify-between gap-4 w-full z-20 my-3">
        <KobalteSelect.Label class="block label">{props.label}</KobalteSelect.Label>
        <KobalteSelect.HiddenSelect />
        <KobalteSelect.Trigger
          class={cn(
            'surface-base flex items-center justify-between rounded-lg min-w-44 max-w-80 p-2 text-sm text-left transition',
            'border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
            'outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-white',
          )}
          aria-label={props.label}
        >
          <KobalteSelect.Value<SelectOption>>
            {(state) => state.selectedOption()?.name ?? props.placeholder ?? ''}
          </KobalteSelect.Value>
          <KobalteSelect.Icon class="ml-2 text-xs opacity-60">▼</KobalteSelect.Icon>
        </KobalteSelect.Trigger>
      </div>

      <KobalteSelect.Portal>
        <KobalteSelect.Content class="z-50 min-w-44 surface-base rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-1 bg-white dark:bg-slate-900">
          <KobalteSelect.Listbox class="max-h-60 overflow-y-auto outline-none" />
        </KobalteSelect.Content>
      </KobalteSelect.Portal>
    </KobalteSelect>
  );
};

export default Select;
