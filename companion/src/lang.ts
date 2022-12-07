export const availableLanguages = ["de", "en"] as const;

export type AvailableLanguages = typeof availableLanguages[number];

export const messages = {
  welcome: {
    de: "Willkommen bei TabDash",
    en: "Welcome to TabDash",
  },
  features: {
    de: ``,
    en: ``,
  },
  goodbye: {
    de: `Danke für deine Nutzung von TabDash. Wenn ich was verbessern kann, lass es mich bitte wissen.`,
    en: `Thank you for using TabDash. If there is anything I can do better, please let me know.`,
  },
  "for chrome": {
    de: `Im Moment nicht als Erweiterung für Chromebasierte Browser verfügbar. Wenn interesse besteht, öffne ein Ticket bei GitHub.`,
    en: `Not available as extension for Chrome based browsers right now. If you are interested, please open an issue on GitHub.`,
  },
  "for firefox": {
    de: `Lade dir TabDash als Erweiterung aus dem Mozilla Erweiterungsstore herunter.`,
    en: `Download TabDash as extension from the Mozilla extension store.`,
  },
};
