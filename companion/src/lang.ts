const availableLanguages = ['de', 'en'] as const;

type AvailableLanguages = (typeof availableLanguages)[number];

const messages = {
    'documentation source': {
      de: `Dokumentation`,
      en: `documentation`,
      link: 'https://github.com/ur-wesley/TabDash/tree/main/companion',
    },
    example: {
      de: ``,
      en: ``,
    },
    'extension source': {
      de: `Erweiterung`,
      en: `extension`,
      link: 'https://github.com/ur-wesley/TabDash/tree/main/extension',
    },
    'for chrome': {
      de: `Im Moment nicht als Erweiterung für Chromebasierte Browser verfügbar. Wenn interesse besteht, öffne ein Ticket bei GitHub.`,
      en: `Not available as extension for Chrome based browsers right now. If you are interested, please open an issue on GitHub.`,
    },
    'for edge': {
      de: `Im Moment nicht als Erweiterung für Microsoft Edge verfügbar. Wenn interesse besteht, öffne ein Ticket bei GitHub.`,
      en: `Not available as extension for Microsoft Edge right now. If you are interested, please open an issue on GitHub.`,
    },
    'for firefox': {
      de: `Lade dir TabDash als Erweiterung aus dem Mozilla Erweiterungsstore herunter.`,
      en: `Download TabDash as extension from the Mozilla extension store.`,
    },
    goodbye: {
      de: `Danke für deine Nutzung von TabDash. Wenn ich was verbessern kann, lass es mich bitte wissen.`,
      en: `Thank you for using TabDash. If there is anything I can do better, please let me know.`,
    },
    'made in': {
      de: 'Entwickelt in Deutschland',
      en: 'developed in Germany',
      es: 'Hecho en Alemania',
      fr: 'Fabriqué en Allemagne',
    },
    privacy: {
      de: 'Datenschutz',
      en: 'privacy',
      es: 'privacidad',
      fr: 'confidentialité',
    },
    source: {
      de: 'Quelle',
      en: 'source',
    },
    welcome: {
      de: 'Willkommen bei',
      en: 'Welcome to',
    },
  },
  features = [
    {
      description: {
        de: 'Mit dieser Funktion kann der Benutzer immer die aktuelle Wetterlage und Vorhersage für seinen Standort einsehen, ohne eine extra Seite öffnen zu müssen.',
        en: 'This feature allows the user to view the current weather and forecast for their location without having to open an extra page.',
      },
      img: '/images/feature1.png',
      title: {
        de: 'Wettervorhersage anzeigen',
        en: 'Show weather forecast',
      },
    },
    {
      description: {
        de: 'Der Benutzer hat die Möglichkeit, das Aussehen und die Funktionalität des neuen Tabs nach seinen Wünschen anzupassen, indem er die Größe und Anordnung der verschiedenen Widgets ändert und zusätzliche Widgets hinzufügt oder entfernt.',
        en: 'The user has the ability to customize the appearance and functionality of the new tab to their liking by changing the size and arrangement of the various widgets and adding or removing additional widgets.',
      },
      img: '/images/feature2.png',
      title: {
        de: 'Layout bearbeiten',
        en: 'Edit layout',
      },
    },
    {
      description: {
        de: 'Der Benutzer kann das Aussehen des neuen Tabs personalisieren, indem er ein eigenes Hintergrundbild auswählt oder hochlädt.',
        en: 'The user can customize the appearance of the new tab by selecting or uploading their own background image.',
      },
      img: '/images/feature3.png',
      title: {
        de: 'Hintergründe bearbeiten',
        en: 'Edit backgrounds',
      },
    },
    {
      description: {
        de: 'Mit dieser Funktion kann der Benutzer schnellen Zugriff auf seine liebsten Webseiten haben, indem er diese in der Leiste der schnellen Links speichert.',
        en: 'This feature allows the user to have quick access to their favorite websites by saving them in the quick links bar.',
      },
      img: '/images/feature4.png',
      title: {
        de: 'Schnelllinks erstellen',
        en: 'Create quick links',
      },
    },
    {
      description: {
        de: 'Der Benutzer kann die bevorzugte Sprache auswählen und die Benutzeroberfläche und angezeigten Inhalte werden dann in der gewählten Sprache angezeigt.',
        en: 'The user can select their preferred language and the user interface and displayed content will then be displayed in the chosen language.',
      },
      img: '/images/feature5.png',
      title: {
        de: 'Mehrsprachigkeit',
        en: 'Multilingual',
      },
    },
  ];

export { availableLanguages, features, messages };
export type { AvailableLanguages };
