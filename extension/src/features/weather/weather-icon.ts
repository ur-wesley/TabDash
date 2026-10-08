/**
 * Maps OpenWeatherMap icon codes (e.g. "01d", "10n") to local MDI icon classes.
 *
 * Remote OWM PNGs have transparent backgrounds with white/yellow artwork that
 * washes out on light wallpapers or translucent widget backgrounds. Local MDI
 * icons inherit `var(--textColor)` (which already goes through contrast
 * handling) and get a dual drop-shadow halo via `.weather-icon`, so they stay
 * legible on any background without external image requests.
 *
 * All returned class names are full string literals so UnoCSS preset-icons
 * static scanning picks them up.
 *
 * @param iconCode OWM icon code such as "01d".
 * @returns Full UnoCSS MDI class for the condition.
 */
const OWM_TO_MDI: Record<string, string> = {
  '01d': 'i-mdi-weather-sunny',
  '01n': 'i-mdi-weather-night',
  '02d': 'i-mdi-weather-partly-cloudy',
  '02n': 'i-mdi-weather-night-partly-cloudy',
  '03d': 'i-mdi-weather-cloudy',
  '03n': 'i-mdi-weather-cloudy',
  '04d': 'i-mdi-weather-cloudy',
  '04n': 'i-mdi-weather-cloudy',
  '09d': 'i-mdi-weather-rainy',
  '09n': 'i-mdi-weather-rainy',
  '10d': 'i-mdi-weather-pouring',
  '10n': 'i-mdi-weather-pouring',
  '11d': 'i-mdi-weather-lightning-rainy',
  '11n': 'i-mdi-weather-lightning-rainy',
  '13d': 'i-mdi-weather-snowy',
  '13n': 'i-mdi-weather-snowy',
  '50d': 'i-mdi-weather-fog',
  '50n': 'i-mdi-weather-fog',
};

export function owmIconToMdi(iconCode?: string | null): string {
  if (iconCode && OWM_TO_MDI[iconCode]) {
    const mapped = OWM_TO_MDI[iconCode];
    if (mapped) return mapped;
  }
  return 'i-mdi-weather-cloudy';
}
