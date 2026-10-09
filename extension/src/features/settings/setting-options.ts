import type { SelectOption } from '../../components/ui/select';
import type { MessageKey } from '../../lang';

export type Translate = (key: MessageKey) => string;

export const SEARCH_ENGINE_OPTIONS: readonly SelectOption[] = [
  { name: 'Google', value: 'google' },
  { name: 'Bing', value: 'bing' },
  { name: 'DuckDuckGo', value: 'duckduckgo' },
  { name: 'Ecosia', value: 'ecosia' },
  { name: 'Brave', value: 'brave' },
  { name: 'Yahoo', value: 'yahoo' },
];

export function weatherUnitOptions(t: Translate): readonly SelectOption[] {
  return [
    { name: `${t('metric')} (°C)`, value: 'metric' },
    { name: `${t('imperial')} (°F)`, value: 'imperial' },
  ];
}

export function shortcutStyleOptions(t: Translate): readonly SelectOption[] {
  return [
    { name: t('small'), value: 'small' },
    { name: t('medium'), value: 'medium' },
    { name: t('large'), value: 'large' },
    { name: t('text only'), value: 'text' },
  ];
}
