export const availableLanguages = ["de", "en"] as const;

export type AvailableLanguages = typeof availableLanguages[number];

export const messages = {
  "example": {
    de: ``,
    en: ``,
  },
  welcome: {
    de: "Willkommen bei",
    en: "Welcome to",
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
  "for edge": {
    de: `Im Moment nicht als Erweiterung für Microsoft Edge verfügbar. Wenn interesse besteht, öffne ein Ticket bei GitHub.`,
    en: `Not available as extension for Microsoft Edge right now. If you are interested, please open an issue on GitHub.`,
  },
  source: {
    de: 'Quelle',
    en: 'source',
  },
  "extension source": {
    link: 'https://github.com/ur-wesley/TabDash/tree/main/extension',
    de: `Erweiterung`,
    en: `extension`,
  },
  "documentation source": {
    link: 'https://github.com/ur-wesley/TabDash/tree/main/companion',
    de: `Dokumentation`,
    en: `documentation`,
  },
  "made in": {
    de: "Entwickelt in Deutschland",
    en: "developed in Germany",
    fr: "Fabriqué en Allemagne",
    es: "Hecho en Alemania"
  },
  privacy: {
    de: "Datenschutz",
    en: "privacy",
    fr: "confidentialité",
    es: "privacidad"
  }
};

export const features = [
  {
    title: {
      de: "Wettervorhersage anzeigen",
      en: "Show weather forecast",
      // fr: "Afficher la prévision météo",
      // es: "Mostrar pronóstico del tiempo"
    },
    description: {
      de: "Mit dieser Funktion kann der Benutzer immer die aktuelle Wetterlage und Vorhersage für seinen Standort einsehen, ohne eine extra Seite öffnen zu müssen.",
      en: "This feature allows the user to view the current weather and forecast for their location without having to open an extra page.",
      // fr: "Cette fonction permet à l'utilisateur de consulter la météo actuelle et les prévisions pour sa localisation sans avoir à ouvrir une page supplémentaire.",
      // es: "Esta función permite al usuario ver el tiempo actual y el pronóstico para su ubicación sin tener que abrir una página adicional."
    },
    img: "/images/feature1.png"
  }, {
    title: {
      de: "Layout bearbeiten",
      en: "Edit layout",
      // fr: "Modifier la disposition",
      // es: "Editar diseño"
    },
    description: {
      de: "Der Benutzer hat die Möglichkeit, das Aussehen und die Funktionalität des neuen Tabs nach seinen Wünschen anzupassen, indem er die Größe und Anordnung der verschiedenen Widgets ändert und zusätzliche Widgets hinzufügt oder entfernt.",
      en: "The user has the ability to customize the appearance and functionality of the new tab to their liking by changing the size and arrangement of the various widgets and adding or removing additional widgets.",
      // fr: "L'utilisateur a la possibilité de personnaliser l'apparence et la fonctionnalité de l'onglet en modifiant la taille et la disposition des widgets et en ajoutant ou en supprimant des widgets supplémentaires.",
      // es: "El usuario tiene la capacidad de personalizar la apariencia y la funcionalidad de la pestaña a su gusto cambiando el tamaño y la disposición de los widgets y agregando o eliminando widgets adicionales."
    },
    img: "/images/feature2.png"
  }, {
    title: {
      de: "Hintergründe bearbeiten",
      en: "Edit backgrounds",
      // fr: "Modifier les arrière-plans",
      // es: "Editar fondos"
    },
    description: {
      de: "Der Benutzer kann das Aussehen des neuen Tabs personalisieren, indem er ein eigenes Hintergrundbild auswählt oder hochlädt.",
      en: "The user can customize the appearance of the new tab by selecting or uploading their own background image.",
      // fr: "L'utilisateur peut personnaliser l'apparence de l'onglet en sélectionnant ou en téléchargeant sa propre image d'arrière-plan.",
      // es: "El usuario puede personalizar la apariencia de la pestaña seleccionando o cargando su propia imagen de fondo."
    },
    img: "/images/feature3.png"
  }, {
    title: {
      de: "Schnelllinks erstellen",
      en: "Create quick links",
      // fr: "Créer des raccourcis",
      // es: "Crear accesos rápidos"
    },
    description: {
      de: "Mit dieser Funktion kann der Benutzer schnellen Zugriff auf seine liebsten Webseiten haben, indem er diese in der Leiste der schnellen Links speichert.",
      en: "This feature allows the user to have quick access to their favorite websites by saving them in the quick links bar.",
      // fr: "Cette fonction permet à l'utilisateur d'avoir un accès rapide à ses sites Web préférés en les enregistrant dans la barre de raccourcis.",
      // es: "Esta función permite al usuario tener acceso rápido a sus sitios web favoritos al guardarlos en la barra de accesos rápidos."
    },
    img: "/images/feature4.png"
  }, {
    title: {
      de: "Mehrsprachigkeit",
      en: "Multilingual",
      // fr: "Multilingue",
      // es: "Multilingüe"
    },
    description: {
      de: "Der Benutzer kann die bevorzugte Sprache auswählen und die Benutzeroberfläche und angezeigten Inhalte werden dann in der gewählten Sprache angezeigt.",
      en: "The user can select their preferred language and the user interface and displayed content will then be displayed in the chosen language.",
      // fr: "L'utilisateur peut sélectionner sa langue préférée et l'interface utilisateur et le contenu affiché seront alors affichés dans la langue choisie.",
      // es: "El usuario puede seleccionar su idioma preferido y la interfaz de usuario y el contenido mostrado se mostrarán en el idioma elegido."
    },
    img: "/images/feature5.png"
  }
]