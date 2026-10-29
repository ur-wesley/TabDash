import { de } from './de.js';
import { en } from './en.js';
import { es } from './es.js';
import { fr } from './fr.js';
import { availableLanguages } from './types.js';
import type { AvailableLanguages, Dict, MessageKey } from './types.js';

const dictionaries: Record<AvailableLanguages, Dict> = {
    de,
    en,
    es,
    fr,
  },
  messages = {} as Record<MessageKey, Record<AvailableLanguages, string>>;

for (const key of Object.keys(en) as MessageKey[]) {
  messages[key] = {
    de: de[key] ?? en[key],
    en: en[key],
    es: es[key] ?? en[key],
    fr: fr[key] ?? en[key],
  };
}

export {
  availableLanguages,
  de,
  dictionaries,
  en,
  es,
  fr,
  messages,
  type AvailableLanguages,
  type Dict,
  type MessageKey,
};
