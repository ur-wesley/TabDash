import type { Component } from 'solid-js';
import { useI18n } from '../../i18n';

export interface GreetingWidgetProps {
  name?: string;
}

export const GreetingWidget: Component<GreetingWidgetProps> = (props) => {
  const { t } = useI18n();

  return (
    <div class="flex flex-col items-center widget select-none">
      <span
        class="my-2 p-3 text-3xl md:text-4xl tracking-tight"
        style={{ 'font-weight': 'var(--weight)' }}
      >
        {t('greeting')} {props.name ?? ''}
      </span>
    </div>
  );
};
