import * as i18n from '@solid-primitives/i18n';
import { createContext, createMemo, createSignal, useContext } from 'solid-js';
import type { Accessor, JSX, ParentComponent, Setter } from 'solid-js';
import { availableLanguages, de, en, es, fr, dictionaries, messages } from './locales/index.js';
import type { AvailableLanguages, Dict, MessageKey } from './locales/index.js';

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
    ),
    activeLocale = () => props.locale ?? internalLocale(),
    handleSetLocale: Setter<AvailableLanguages> = (next) => {
      const resolved =
        typeof next === 'function'
          ? (next as (prev: AvailableLanguages) => AvailableLanguages)(activeLocale())
          : next;
      setInternalLocale(resolved);
      props.onLocaleChange?.(resolved);
      return resolved;
    },
    currentDict = createMemo<Dict>(() => {
      const lang = activeLocale();
      return dictionaries[lang] ?? dictionaries.en;
    }),
    t = i18n.translator(currentDict, i18n.resolveTemplate),
    value: I18nContextValue = {
      dict: currentDict,
      locale: activeLocale,
      setLocale: handleSetLocale,
      t,
    };

  return <I18nContext.Provider value={value}>{props.children}</I18nContext.Provider>;
};

const fallbackLocale = () => 'en' as AvailableLanguages,
  fallbackDict = () => dictionaries.en,
  fallbackT = i18n.translator(fallbackDict, i18n.resolveTemplate);

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      dict: fallbackDict,
      locale: fallbackLocale,
      setLocale: () => 'en',
      t: fallbackT,
    };
  }
  return context;
};

export { availableLanguages, de, en, es, fr, messages, dictionaries };
export type { AvailableLanguages, Dict, MessageKey };
