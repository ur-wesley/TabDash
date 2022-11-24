export const availableLanguages = ["de", "en"] as const;

export type AvailableLanguages = typeof availableLanguages[number];

export const messages = {
  welcome: {
    de: "Willkommen",
    en: "Welcome",
  },
  features: {
    de: ``,
    en: ``,
  },
  goodbye: {
    de: ``,
    en: ``,
  },
};
