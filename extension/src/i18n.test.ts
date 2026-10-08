import { describe, expect, it } from 'bun:test';
import * as i18n from '@solid-primitives/i18n';
import { createRoot, createSignal } from 'solid-js';
import {
  availableLanguages,
  type AvailableLanguages,
  de,
  dictionaries,
  en,
  es,
  fr,
  messages,
} from './i18n.jsx';
import type { MessageKey } from './locales/types.js';

const templateDict = () => ({
  welcome: 'Hello {{ name }}!',
});

describe('i18n individual language files and dictionaries', () => {
  it('loads each language from its own dedicated module', () => {
    expect(en).toBeDefined();
    expect(de).toBeDefined();
    expect(fr).toBeDefined();
    expect(es).toBeDefined();

    expect(en.settings).toBe('Settings');
    expect(de.settings).toBe('Einstellungen');
    expect(fr.settings).toBe('Paramètres');
    expect(es.settings).toBe('Ajustes');
  });

  it('guarantees all language files have all identical keys matching en', () => {
    const enKeys = Object.keys(en).toSorted();
    const deKeys = Object.keys(de).toSorted();
    const frKeys = Object.keys(fr).toSorted();
    const esKeys = Object.keys(es).toSorted();

    expect(deKeys).toEqual(enKeys);
    expect(frKeys).toEqual(enKeys);
    expect(esKeys).toEqual(enKeys);

    for (const key of enKeys as MessageKey[]) {
      expect(en[key]).toBeTruthy();
      expect(de[key]).toBeTruthy();
      expect(fr[key]).toBeTruthy();
      expect(es[key]).toBeTruthy();
    }
  });

  it('provides matching entries in dictionaries record and backwards-compatible messages', () => {
    for (const lang of availableLanguages) {
      expect(dictionaries[lang]).toBeDefined();
      expect(dictionaries[lang].settings).toBe(messages.settings[lang]);
      expect(dictionaries[lang].general).toBe(messages.general[lang]);
      expect(dictionaries[lang]['shortcut name']).toBe(messages['shortcut name'][lang]);
    }
  });

  it('translates reactive updates when locale changes', () => {
    createRoot((dispose) => {
      const [locale, setLocale] = createSignal<AvailableLanguages>('en');
      const t = i18n.translator(() => dictionaries[locale()], i18n.resolveTemplate);

      expect(t('settings')).toBe('Settings');
      expect(t('close')).toBe('Close');
      expect(t('background')).toBe('background');

      setLocale('de');
      expect(t('settings')).toBe('Einstellungen');
      expect(t('close')).toBe('Schließen');
      expect(t('background')).toBe('Hintergrund');

      setLocale('fr');
      expect(t('settings')).toBe('Paramètres');
      expect(t('close')).toBe('Fermer');

      setLocale('es');
      expect(t('settings')).toBe('Ajustes');
      expect(t('close')).toBe('Cerrar');

      dispose();
    });
  });

  it('provides complete theme and appearance keys across all languages', () => {
    // English theme labels
    expect(en.theme).toBe('Theme');
    expect(en.light).toBe('Light');
    expect(en.dark).toBe('Dark');
    expect(en.system).toBe('System');
    expect(en.automatic).toBe('Automatic');
    expect(en['theme mode']).toBe('Theme mode');
    expect(en['dark mode']).toBe('Dark mode');
    expect(en['widget theme']).toBe('Widget theme');
    expect(en['widget appearance']).toBe('Widget appearance');

    // German theme labels
    expect(de.theme).toBe('Thema');
    expect(de.light).toBe('Hell');
    expect(de.dark).toBe('Dunkel');
    expect(de.system).toBe('System');
    expect(de.automatic).toBe('Automatisch');
    expect(de['theme mode']).toBe('Designmodus');
    expect(de['dark mode']).toBe('Dunkelmodus');
    expect(de['widget theme']).toBe('Widget-Design');

    // French theme labels (and ensure not corrupted with "automatique")
    expect(fr.theme).toBe('Thème');
    expect(fr.light).toBe('Clair');
    expect(fr.dark).toBe('Sombre');
    expect(fr.system).toBe('Système');
    expect(fr.automatic).toBe('Automatique');
    expect(fr['text color']).toBe('Couleur du texte');
    expect(fr['background color']).toBe("Couleur d'arrière-plan");
    expect(fr['border radius']).toBe('Rayon de bordure');
    expect(fr['widget appearance']).toBe('Apparence du widget');

    // Spanish theme labels (and ensure not corrupted with "automático")
    expect(es.theme).toBe('Tema');
    expect(es.light).toBe('Claro');
    expect(es.dark).toBe('Oscuro');
    expect(es.system).toBe('Sistema');
    expect(es.automatic).toBe('Automático');
    expect(es['text color']).toBe('Color del texto');
    expect(es['background color']).toBe('Color de fondo');
    expect(es['border radius']).toBe('Radio de borde');
    expect(es['widget appearance']).toBe('Apariencia del widget');
  });

  it('resolves templates correctly', () => {
    createRoot((dispose) => {
      const t = i18n.translator(templateDict, i18n.resolveTemplate);
      expect(t('welcome', { name: 'TabDash' })).toBe('Hello TabDash!');
      dispose();
    });
  });
});
