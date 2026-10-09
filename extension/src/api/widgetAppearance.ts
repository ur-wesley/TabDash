import type { WidgetAppereance } from '../../types/settings.js';
import { ensureWidgetContrast } from '../lib/colorContrast.js';

export * from '../lib/colorContrast.js';

export default (widget?: WidgetAppereance, options?: { autoContrast?: boolean }) => {
  if (!widget) {
    return;
  }
  // Auto contrast is the default: keep the user's text color when it already
  // Has the best contrast, otherwise fall back to the most readable option.
  // Pass `{ autoContrast: false }` to opt out and use the raw text color.
  const autoContrast = options?.autoContrast ?? true,
    effectiveTextColor =
      autoContrast && widget.background
        ? ensureWidgetContrast({
            background: widget.background,
            preferredTextColor: widget.textColor,
          })
        : widget.textColor;

  if (effectiveTextColor) {
    document.documentElement.style.setProperty('--textColor', effectiveTextColor);
  }
  if (widget.textSize) {
    document.documentElement.style.setProperty('--textSize', widget.textSize);
  }
  if (widget.background) {
    document.documentElement.style.setProperty('--background', widget.background);
    const contrastColor = ensureWidgetContrast({
      background: widget.background,
      preferredTextColor: widget.textColor,
    });
    document.documentElement.style.setProperty('--contrastTextColor', contrastColor);
  }
  if (widget.borderRadius) {
    document.documentElement.style.setProperty('--borderRadius', widget.borderRadius);
  }
  if (widget.shadow) {
    document.documentElement.style.setProperty('--shadow', widget.shadow);
  }
  if (widget.font) {
    document.documentElement.style.setProperty('--font', widget.font);
  }
  if (widget.weight) {
    document.documentElement.style.setProperty('--weight', widget.weight);
  }
  if (widget.backdrop?.blur) {
    document.documentElement.style.setProperty('--backdrop_blur', widget.backdrop.blur);
  }
  if (widget.backdrop?.saturate) {
    document.documentElement.style.setProperty('--backdrop_saturate', widget.backdrop.saturate);
  }
  if (widget.backdrop?.brightness) {
    document.documentElement.style.setProperty('--backdrop_brightness', widget.backdrop.brightness);
  }
};
