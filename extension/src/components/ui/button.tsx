import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { splitProps } from 'solid-js';
import type { ComponentProps } from 'solid-js';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98]',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 px-4 py-2',
        icon: 'h-9 w-9 p-0',
        lg: 'h-10 px-8 text-base',
        sm: 'h-8 px-3 text-xs gap-1.5',
      },
      variant: {
        default:
          'bg-[var(--primary)] text-[var(--on-brand)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] shadow-[0_1px_2px_0_var(--primary-shadow)] font-medium border border-[var(--primary-border)]',
        destructive:
          'bg-[var(--danger)] text-[var(--on-brand)] hover:bg-[var(--danger-hover)] active:bg-[var(--danger-active)] shadow-[0_1px_2px_0_var(--danger-shadow)] font-medium border border-[var(--danger-border)]',
        ghost:
          'hover:bg-[var(--ghost-hover)] text-[var(--fg-muted)] hover:text-[var(--fg-strong)] active:bg-[var(--ghost-active)]',
        link: 'text-[var(--primary-fg)] underline-offset-4 hover:underline active:text-[var(--primary-fg-active)]',
        outline:
          'border border-[var(--border-btn-outline)] bg-[var(--btn-outline-bg)] hover:bg-[var(--btn-outline-hover)] hover:border-[var(--border-btn-outline-hover)] text-[var(--fg-label)] hover:text-[var(--fg-strong)] shadow-xs backdrop-blur-sm active:bg-[var(--btn-outline-active)] font-medium',
        secondary:
          'bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] active:bg-[var(--btn-secondary-active)] text-[var(--fg-label)] border border-[var(--border-btn-secondary)] shadow-xs font-medium',
      },
    },
  },
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, ['class', 'variant', 'size', 'type']);

  return (
    <button
      type={local.type ?? 'button'}
      class={cn(buttonVariants({ size: local.size, variant: local.variant }), local.class)}
      {...others}
    />
  );
}
