import { type Component, type JSX, Show, children } from 'solid-js';
import { cn } from '../../lib/utils';

export interface CategorySectionProps {
  title: string;
  helpLink?: string;
  class?: string;
  children?: JSX.Element;
}

export const CategorySection: Component<CategorySectionProps> = (props) => {
  const resolvedChildren = children(() => props.children);

  return (
    <section class={cn('w-full min-w-0 max-w-full flex flex-col gap-1.5', props.class)}>
      <div class="px-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
        <span class="truncate">{props.title}</span>
        <Show when={typeof props.helpLink === 'string' && Boolean(props.helpLink)}>
          <a
            href={props.helpLink}
            target="_blank"
            rel="noopener noreferrer"
            class="w-5 h-5 rounded-full inline-flex items-center justify-center shrink-0 bg-slate-200/80 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white transition-colors"
            aria-label={`${props.title} help`}
          >
            <span class="i-mdi-help text-xs" aria-hidden="true" />
          </a>
        </Show>
      </div>
      <div class="w-full min-w-0 max-w-full rounded-xl bg-white/40 dark:bg-zinc-800/40 border border-black/5 dark:border-white/10 p-3 flex flex-col gap-1.5 shadow-sm backdrop-blur-md transition-colors overflow-hidden">
        {resolvedChildren()}
      </div>
    </section>
  );
};
