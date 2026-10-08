import type { SelectOption } from '../../components/ui/select';
import type { MessageKey } from '../../lang';

export type Translate = (key: MessageKey) => string;

export const SEARCH_ENGINE_OPTIONS: readonly SelectOption[] = [
  { value: 'google', name: 'Google' },
  { value: 'bing', name: 'Bing' },
  { value: 'duckduckgo', name: 'DuckDuckGo' },
  { value: 'ecosia', name: 'Ecosia' },
  { value: 'brave', name: 'Brave' },
  { value: 'yahoo', name: 'Yahoo' },
];

export function weatherUnitOptions(t: Translate): readonly SelectOption[] {
  return [
    { value: 'metric', name: `${t('metric')} (°C)` },
    { value: 'imperial', name: `${t('imperial')} (°F)` },
  ];
}

export function shortcutStyleOptions(t: Translate): readonly SelectOption[] {
  return [
    { value: 'small', name: t('small') },
    { value: 'medium', name: t('medium') },
    { value: 'large', name: t('large') },
    { value: 'text', name: t('text only') },
  ];
}
