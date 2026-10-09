import { createMemo } from 'solid-js';
import type { Component } from 'solid-js';
import type { BackgroundData, Setting } from '../../../types/settings';
import { useI18n } from '../../i18n';
import { DEFAULT_WIDGET_BACKGROUND, ensureWidgetContrast } from '../../lib/colorContrast';
import { useSettingsContext } from '../settings/settings-context';
import { AUTHOR_CREDIT_TEXT_SHADOW, withUnsplashAttribution } from './attribution';

export const AUTHOR_CREDIT_CLASS =
  'absolute bottom-0 left-0 px-2 py-0.5 widget text-[10px] md:text-[11px] leading-tight rounded-none rounded-tr-md z-20 flex items-center gap-1 select-none';

const AUTHOR_CREDIT_LINK_CLASS =
  'opacity-100 font-medium underline-offset-2 hover:underline transition-opacity';

export function getAuthorCreditContrast(
  background?: string,
  preferredTextColor?: string,
): { color: string; background: string } {
  const bg = background ?? DEFAULT_WIDGET_BACKGROUND,
    color = ensureWidgetContrast({
      background: bg,
      preferredTextColor,
    });
  return {
    background: bg,
    color,
  };
}

export interface AuthorCreditProps {
  information?: BackgroundData;
  /**
   * Optional individual background color override.
   * If omitted, falls back to the current widget setting background.
   */
  background?: string;
  /**
   * Optional preferred text color.
   */
  textColor?: string;
}

function resolveThemeKey(activeTheme?: string): 'light' | 'dark' {
  if (activeTheme === 'dark') {
    return 'dark';
  }
  if (activeTheme === 'light') {
    return 'light';
  }
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  return 'light';
}

export const AuthorCredit: Component<AuthorCreditProps> = (props) => {
  const { t } = useI18n();

  let contextSettings: Setting | undefined;
  try {
    const [state] = useSettingsContext();
    contextSettings = state;
  } catch {
    // Optional fallback when rendered outside SettingsProvider
  }

  const effectiveBackground = createMemo(() => {
      if (props.background) {
        return props.background;
      }
      if (contextSettings?.widgetSetting) {
        const themeKey = resolveThemeKey(contextSettings.general?.theme),
          bg = contextSettings.widgetSetting[themeKey]?.background;
        if (bg) {
          return bg;
        }
      }
      return DEFAULT_WIDGET_BACKGROUND;
    }),
    effectivePreferredText = createMemo(() => {
      if (props.textColor) {
        return props.textColor;
      }
      if (contextSettings?.widgetSetting) {
        const activeTheme = contextSettings.general?.theme ?? 'light',
          themeKey = activeTheme === 'dark' ? 'dark' : 'light';
        return contextSettings.widgetSetting[themeKey]?.textColor;
      }
      return undefined;
    }),
    contrastStyle = createMemo(() =>
      getAuthorCreditContrast(effectiveBackground(), effectivePreferredText()),
    );

  return (
    <span
      class={AUTHOR_CREDIT_CLASS}
      style={{
        'background-color': contrastStyle().background,
        color: contrastStyle().color,
        'text-shadow': AUTHOR_CREDIT_TEXT_SHADOW,
      }}
    >
      <a
        class={AUTHOR_CREDIT_LINK_CLASS}
        href={withUnsplashAttribution(props.information?.origin)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('photo by')}
      </a>
      <a
        class={AUTHOR_CREDIT_LINK_CLASS}
        href={withUnsplashAttribution(props.information?.profile)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.information?.author || t('unsplash')}
      </a>
      <span class="opacity-100">{t('on unsplash')}</span>
      <a
        class={AUTHOR_CREDIT_LINK_CLASS}
        href={withUnsplashAttribution()}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('unsplash')}
      </a>
    </span>
  );
};
