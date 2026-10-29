import { createContext, createMemo, createSignal, useContext } from 'solid-js';
import type { Accessor, JSX, ParentComponent, Setter } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { availableLanguages, de, dictionaries, en, es, fr, messages } from './locales/index.js';
import type { AvailableLanguages, Dict, MessageKey } from './locales/index.js';

interface I18nContextValue {
  readonly locale: Accessor<AvailableLanguages>;
  readonly setLocale: Setter<AvailableLanguages>;
  readonly t: i18n.Translator<Dict>;
  readonly dict: Accessor<Dict>;
}

const I18nContext = createContext<I18nContextValue>();

interface I18nProviderProps {
  readonly locale?: AvailableLanguages;
  readonly onLocaleChange?: (locale: AvailableLanguages) => void;
  readonly children: JSX.Element;
}

const I18nProvider: ParentComponent<I18nProviderProps> = (props) => {
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
  },
  fallbackLocale = () => 'en' as AvailableLanguages,
  fallbackDict = () => dictionaries.en,
  fallbackT = i18n.translator(fallbackDict, i18n.resolveTemplate),
  useI18n = (): I18nContextValue => {
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

export {
  I18nProvider,
  availableLanguages,
  de,
  dictionaries,
  en,
  es,
  fr,
  messages,
  useI18n,
  type AvailableLanguages,
  type Dict,
  type I18nContextValue,
  type I18nProviderProps,
  type MessageKey,
};
