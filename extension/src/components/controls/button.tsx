import { Button as KobalteButton } from '@kobalte/core/button';
import { type Component, type JSX, children } from 'solid-js';
import { cn } from '../../lib/utils.js';

export type ButtonType = 'primary' | 'error' | 'success';

export interface TextButtonProps {
  readonly children?: JSX.Element;
  readonly background?: boolean;
  readonly type?: ButtonType;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
}

const TextButton: Component<TextButtonProps> = (props) => {
  const c = children(() => props.children);

  const getVariantStyles = (): string => {
    const bg = props.background ?? false;
    const variant = props.type ?? 'primary';

    if (bg) {
      switch (variant) {
        case 'primary':
          return 'bg-blue-500 text-white hover:bg-blue-600';
        case 'error':
          return 'bg-red-500 text-white hover:bg-red-600';
        case 'success':
          return 'bg-green-500 text-white hover:bg-green-600';
        default:
          return 'bg-blue-500 text-white hover:bg-blue-600';
      }
    }

    switch (variant) {
      case 'primary':
        return 'bg-transparent text-blue-500 hover:bg-blue-500/10';
      case 'error':
        return 'bg-transparent text-red-500 hover:bg-red-500/10';
      case 'success':
        return 'bg-transparent text-green-500 hover:bg-green-500/10';
      default:
        return 'bg-transparent text-blue-500 hover:bg-blue-500/10';
    }
  };

  return (
    <KobalteButton
      onClick={props.onClick}
      disabled={props.disabled}
      class={cn(
        'px-4 py-2 rounded-xl border-none cursor-pointer transition font-medium tracking-wide text-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
        getVariantStyles(),
      )}
    >
      {c()}
    </KobalteButton>
  );
};

export default TextButton;
