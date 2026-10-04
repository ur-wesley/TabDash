import { Switch } from '@kobalte/core/switch';
import type { Component } from 'solid-js';
import { cn } from '../../lib/utils.js';

export interface ToggleProps {
  readonly onChange: (checked: boolean) => void;
  readonly label: string;
  readonly checked?: boolean;
  readonly disabled?: boolean;
}

const Toggle: Component<ToggleProps> = (props) => {
  return (
    <Switch
      class="flex items-center justify-between w-full my-3"
      checked={props.checked ?? false}
      onChange={props.onChange}
      disabled={props.disabled}
    >
      <Switch.Label class="color-base label cursor-pointer">{props.label}</Switch.Label>
      <Switch.Input class="sr-only" />
      <Switch.Control
        class={cn(
          'inline-flex items-center w-14 h-8 p-1 rounded-full transition-colors cursor-pointer',
          props.checked ? 'bg-blue-500' : 'surface-base',
        )}
      >
        <Switch.Thumb
          class={cn(
            'w-6 h-6 rounded-full bg-base shadow-sm transition-transform duration-200',
            props.checked ? 'translate-x-6' : 'translate-x-0',
          )}
        />
      </Switch.Control>
    </Switch>
  );
};

export default Toggle;
