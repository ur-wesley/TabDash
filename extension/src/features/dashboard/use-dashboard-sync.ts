import { createEffect } from 'solid-js';
import widgetAppearance from '../../api/widgetAppearance';
import { useI18n } from '../../i18n';
import { useSettingsContext } from '../settings/settings-context';
import { useTheme } from '../theme/theme-store';

/** Applies theme CSS vars, document title/favicon, and locale from settings. */
export function useDashboardSync(): void {
  const { locale, setLocale } = useI18n(),
    [state] = useSettingsContext(),
    { resolvedTheme } = useTheme();

  createEffect(() => {
    if (!state.general) {
      return;
    }

    const themeKey = resolvedTheme(),
      themeSettings = state.widgetSetting?.[themeKey] ?? state.widgetSetting?.light;
    if (themeSettings) {
      widgetAppearance(themeSettings);
    }

    if (typeof document !== 'undefined') {
      document.title = state.general.title || 'TabDash';
      const faviconEl = document.querySelector('#favicon');
      if (faviconEl instanceof HTMLLinkElement) {
        faviconEl.href = state.general.favicon || '/favicon.svg';
      }
    }

    if (state.general.locale && state.general.locale !== locale()) {
      setLocale(state.general.locale);
    }
  });
}
