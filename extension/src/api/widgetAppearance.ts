import { WidgetAppereance } from "../../types/settings.js";

export default (widget: WidgetAppereance) => {
  document.documentElement.style.setProperty("--textColor", widget.textColor);
  document.documentElement.style.setProperty("--textSize", widget.textSize);
  document.documentElement.style.setProperty("--background", widget.background);
  document.documentElement.style.setProperty(
    "--borderRadius",
    widget.borderRadius
  );
  document.documentElement.style.setProperty("--shadow", widget.shadow);
  document.documentElement.style.setProperty("--font", widget.font);
  document.documentElement.style.setProperty("--weight", widget.weight);
  document.documentElement.style.setProperty(
    "--backdrop_blur",
    widget.backdrop.blur
  );
  document.documentElement.style.setProperty(
    "--backdrop_saturate",
    widget.backdrop.saturate
  );
  document.documentElement.style.setProperty(
    "--backdrop_brightness",
    widget.backdrop.brightness
  );
};
