import * as i18n from '@solid-primitives/i18n';
import {
  type Accessor,
  createContext,
  createMemo,
  createSignal,
  type JSX,
  type ParentComponent,
  type Setter,
  useContext,
} from 'solid-js';
import {
  availableLanguages,
  type AvailableLanguages,
  de,
  en,
  es,
  fr,
  type Dict,
  dictionaries,
  type MessageKey,
  messages,
} from './locales/index.js';

export interface I18nContextValue {
  readonly locale: Accessor<AvailableLanguages>;
  readonly setLocale: Setter<AvailableLanguages>;
  readonly t: i18n.Translator<Dict>;
  readonly dict: Accessor<Dict>;
}

const I18nContext = createContext<I18nContextValue>();

export interface I18nProviderProps {
  readonly locale?: AvailableLanguages;
  readonly onLocaleChange?: (locale: AvailableLanguages) => void;
  readonly children: JSX.Element;
}

export const I18nProvider: ParentComponent<I18nProviderProps> = (props) => {
  const [internalLocale, setInternalLocale] = createSignal<AvailableLanguages>(
    props.locale ?? 'en',
  );

  const activeLocale = () => props.locale ?? internalLocale();

  const handleSetLocale: Setter<AvailableLanguages> = (next) => {
    const resolved =
      typeof next === 'function'
        ? (next as (prev: AvailableLanguages) => AvailableLanguages)(activeLocale())
        : next;
    setInternalLocale(resolved);
    props.onLocaleChange?.(resolved);
    return resolved;
  };

  const currentDict = createMemo<Dict>(() => {
    const lang = activeLocale();
    return dictionaries[lang] ?? dictionaries.en;
  });

  const t = i18n.translator(currentDict, i18n.resolveTemplate);

  const value: I18nContextValue = {
    locale: activeLocale,
    setLocale: handleSetLocale,
    t,
    dict: currentDict,
  };

  return <I18nContext.Provider value={value}>{props.children}</I18nContext.Provider>;
};

const fallbackLocale = () => 'en' as AvailableLanguages;
const fallbackDict = () => dictionaries.en;
const fallbackT = i18n.translator(fallbackDict, i18n.resolveTemplate);

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: fallbackLocale,
      setLocale: (() => 'en') as Setter<AvailableLanguages>,
      t: fallbackT,
      dict: fallbackDict,
    };
  }
  return context;
};

export { availableLanguages, de, en, es, fr, messages, dictionaries };
export type { AvailableLanguages, Dict, MessageKey };
