export const availableLanguages = ["de", "en", "fr", "es"] as const;

export type AvailableLanguages = (typeof availableLanguages)[number];

export const helpLinks = {
  base:
    (import.meta.env.VITE_COMPANION_BASE || "http://localhost:3000") + "/docs/",
  general: "/general",
  layout: "/layout",
  background: "/background",
  shortcut: "/shortcut",
  time: "/time",
  date: "/date",
  management: "/management",
  weather: "/weather",
  search: "/search",
};

export const searchEngine = [
  {
    name: "Startpage",
    link: "https://www.startpage.com/sp/search?q=$s",
  },
  {
    name: "Ecosia",
    link: "https://www.ecosia.org/search?method=index&q=$s",
  },
  {
    name: "DuckDuckGo",
    link: "https://duckduckgo.com/?q=$s",
  },
];

export const messages = {
  general: {
    de: "Allgemein",
    en: "general",
    fr: "général",
    es: "general",
  },
  name: {
    de: "Name",
    en: "name",
    fr: "nom",
    es: "nombre",
  },
  locale: {
    de: "Sprache",
    en: "language",
    fr: "langue",
    es: "idioma",
  },
  favicon: {
    de: "Tab Symbol",
    en: "tab icon",
    fr: "icône de l'onglet",
    es: "icono de pestaña",
  },
  title: {
    de: "Titel",
    en: "title",
    fr: "titre",
    es: "título",
  },
  "browser sync": {
    de: "Browser Synchronisierung",
    en: "browser syncing",
    fr: "synchronisation du navigateur",
    es: "sincronización de navegador",
  },
  layout: {
    de: "Layout",
    en: "layout",
    fr: "disposition",
    es: "diseño",
  },
  "show clock": {
    de: "Uhrzeit anzeigen",
    en: "show clock",
    fr: "montrer l'horloge",
    es: "mostrar reloj",
  },
  "show date": {
    de: "Datum anzeigen",
    en: "show date",
    fr: "montrer la date",
    es: "mostrar fecha",
  },
  "show greeting": {
    de: "Gruß anzeigen",
    en: "show greeting",
    fr: "montrer la salutation",
    es: "mostrar saludo",
  },
  greeting: {
    de: "Willkommen",
    en: "welcome",
    fr: "bienvenue",
    es: "bienvenido",
  },
  "show searchbar": {
    de: "Suchbar anzeigen",
    en: "show searchbar",
    fr: "montrer la barre de recherche",
    es: "mostrar barra de búsqueda",
  },
  "show weather": {
    de: "Wetter anzeigen",
    en: "show weather",
    fr: "montrer la météo",
    es: "mostrar el tiempo",
  },
  "show shortcuts": {
    de: "Schnelllinks anzeigen",
    en: "show shortcuts",
    fr: "montrer les raccourcis",
    es: "mostrar accesos directos",
  },
  background: {
    de: "Hintergrund",
    en: "background",
    fr: "arrière-plan",
    es: "fondo",
  },
  "bg active": {
    de: "Hintergrund aktiv",
    en: "background active",
    fr: "arrière-plan actif",
    es: "fondo activo",
  },
  collections: {
    de: "Sammlungen",
    en: "collections",
    fr: "collections",
    es: "colecciones",
  },
  backdrop: {
    de: "Hintergrundfilter",
    en: "background filter",
    fr: "filtre d'arrière-plan",
    es: "filtro de fondo",
  },
  blur: {
    de: "verwischen",
    en: "blur",
    fr: "flou",
    es: "desenfoque",
  },
  brightness: {
    de: "Helligkeit",
    en: "brightness",
    fr: "luminosité",
    es: "brillo",
  },
  saturate: {
    de: "Sättigung",
    en: "saturation",
    fr: "saturation",
    es: "saturación",
  },
  "reload img": {
    de: "Bild neu laden",
    en: "reload image",
    fr: "recharger l'image",
    es: "recargar imagen",
  },
  color: {
    de: "Farbe",
    en: "color",
    fr: "couleur",
    es: "color",
  },
  "static img": {
    de: "statisches Bild",
    en: "static Image",
    fr: "image statique",
    es: "imagen estática",
  },
  "shortcut settings": {
    de: "Schnelllink Einstellungen",
    en: "shortcut settings",
    fr: "réglages de raccourcis",
    es: "ajustes de accesos directos",
  },
  "new shortcut": {
    de: "Schnelllink erstellen",
    en: "create shortcut",
    fr: "créer un raccourci",
    es: "crear acceso directo",
  },
  "shortcuts per line": {
    de: "Schnelllinks pro Reihe",
    en: "shortcuts per row",
    fr: "raccourcis par ligne",
    es: "accesos directos por fila",
  },
  "shortcut size": {
    de: "Größe",
    en: "size",
    fr: "taille",
    es: "tamaño",
  },
  "shortcut name": {
    de: "Name",
    en: "name",
    fr: "nom",
    es: "nombre",
  },
  "shortcut link": {
    de: "Adresse",
    en: "link",
    fr: "lien",
    es: "enlace",
  },
  "shortcut icon": {
    de: "Symbol",
    en: "icon",
    es: "icono",
    fr: "icône",
  },
  "shortcut icon only": {
    de: "nur Symbol",
    en: "icon only",
    es: "sólo icono",
    fr: "icône seule",
  },
  "new tab": {
    de: "im neuen Tab öffnen",
    en: "open in new tab",
    es: "abrir en pestaña nueva",
    fr: "ouvrir dans un nouvel onglet",
  },
  add: {
    de: "Hinzufügen",
    en: "add",
    es: "añadir",
    fr: "ajouter",
  },
  "time and date": {
    de: "Zeit und Datum",
    en: "time and date",
    es: "hora y fecha",
    fr: "heure et date",
  },
  "show seconds": {
    de: "Sekunden anzeigen",
    en: "show seconds",
    es: "mostrar segundos",
    fr: "montrer les secondes",
  },
  weather: {
    de: "Wetter",
    en: "weather",
    es: "tiempo",
    fr: "météo",
  },
  imperial: {
    de: "Imperial",
    en: "imperial",
    es: "imperial",
    fr: "impérial",
  },
  "show weather icon": {
    de: "Wetter Symbol",
    en: "weather icon",
    es: "icono del tiempo",
    fr: "icône de la météo",
  },
  "show weather text": {
    de: "Wetter beschreibung",
    en: "weather description",
    es: "descripción del tiempo",
    fr: "description de la météo",
  },
  management: {
    de: "Verwaltung",
    en: "management",
    es: "gestión",
    fr: "gestion",
  },
  "setting in cloud": {
    de: "Online speichern?",
    en: "save online?",
    es: "¿guardar en línea?",
    fr: "enregistrer en ligne ?",
  },
  import: {
    de: "importieren",
    en: "import",
    es: "importar",
    fr: "importer",
  },
  export: {
    de: "exportieren",
    en: "export",
    es: "exportar",
    fr: "exporter",
  },
  "import cloud": {
    de: "online wiederherstellen",
    en: "Restore from cloud",
    fr: "rétablir en ligne",
    es: "restaurar desde la nube",
  },
  "import local": {
    de: "aus Zwischenablage lesen",
    en: "read settings from clipboard",
    fr: "lire les paramètres du presse-papiers",
    es: "leer configuraciones del portapapeles",
  },
  "import success clipboard": {
    de: "Einstellungen wurden erfolgreich aus der Zwischenablage importiert",
    en: "settings successfully copied from clipboard",
    fr: "paramètres copiés avec succès depuis le presse-papiers",
    es: "configuraciones copiadas exitosamente desde el portapapeles",
  },
  "import success cloud": {
    de: "Einstellungen wurden erfolgreich wiederhergestellt",
    en: "settings were restored successfully",
    fr: "paramètres restaurés avec succès",
    es: "configuraciones restauradas exitosamente",
  },
  "import fail": {
    de: "Einstellungen konnten nicht wiederhergestellt werden",
    en: "settings could not be restored",
    fr: "impossible de rétablir les paramètres",
    es: "no se pudieron restaurar las configuraciones",
  },
  "export cloud": {
    de: "online speichern",
    en: "save online",
    fr: "enregistrer en ligne",
    es: "guardar en línea",
  },
  "export local": {
    de: "in Zwischenablage schreiben",
    en: "copy to clipboard",
    fr: "copier dans le presse-papiers",
    es: "copiar al portapapeles",
  },
  "export success clipboard": {
    de: "Einstellungen wurden erfolgreich in die Zwischenablage exportiert",
    en: "settings successfully copied to clipboard",
    fr: "paramètres copiés avec succès dans le presse-papiers",
    es: "configuraciones copiadas exitosamente al portapapeles",
  },
  "export success cloud": {
    de: "Einstellungen wurden erfolgreich gespeichert",
    en: "settings got saved successfully",
    fr: "paramètres enregistrés avec succès",
    es: "configuraciones guardadas exitosamente",
  },
  "export fail": {
    de: "Einstellungen konnten nicht exportiert werden",
    en: "settings could not be exported",
    fr: "impossible d'exporter les paramètres",
    es: "no se pudieron exportar las configuraciones",
  },
  "save to file": {
    de: "in Datei speichern",
    en: "save to file",
    fr: "enregistrer dans un fichier",
    es: "guardar en archivo",
  },
  "setting input": {
    de: "Einstellungen einfügen",
    en: "setting input",
    fr: "insérer les paramètres",
    es: "ingresar configuraciones",
  },
  reset: {
    de: "Einstellungen zurücksetzen",
    en: "reset settings",
    fr: "réinitialiser les paramètres",
    es: "reiniciar configuraciones",
  },
  clipboard: {
    de: "Zwischenablage",
    en: "clipboard",
    fr: "presse-papiers",
    es: "portapapeles",
  },
  search: {
    de: "Suche",
    en: "search",
    fr: "chercher",
    es: "buscar",
  },
  save: {
    de: "Speichern",
    en: "save",
    fr: "enregistrer",
    es: "guardar",
  },
  delete: {
    de: "Löschen",
    en: "delete",
    fr: "supprimer",
    es: "eliminar",
  },
  "confirm delete": {
    de: "Löschen bestätigen",
    en: "confirm delete",
    fr: "confirmer la suppression",
    es: "confirmar eliminación",
  },
  "confirm reset": {
    de: "Alle Einstellungen auf Standard stellen?",
    en: "Reset all settings to default?",
    fr: "réinitialiser tous les paramètres par défaut?",
    es: "¿Reiniciar todas las configuraciones a sus valores predeterminados?",
  },
  "photo by": {
    de: "Foto von",
    en: "photo by",
    fr: "photo par",
    es: "foto por",
  },
  large: {
    de: "Groß",
    en: "large",
    fr: "grand",
    es: "grande",
  },
  medium: {
    de: "Mittel",
    en: "medium",
    fr: "moyen",
    es: "mediano",
  },
  small: {
    de: "Klein",
    en: "small",
    fr: "petit",
    es: "pequeño",
  },
  text: {
    de: "Text",
    en: "text",
    fr: "texte",
    es: "texto",
  },
  "setting id": {
    de: "Einstellung ID",
    en: "setting id",
    fr: "identifiant du paramètre",
    es: "ID de configuración",
  },
  "incorrect id": {
    de: "ID hat falsches Format",
    en: "incorrect id formatting",
    fr: "format d'identifiant incorrect",
    es: "formato de ID incorrecto",
  },
  "search settings": {
    de: "Sucheinstellungen",
    en: "search settings",
    fr: "paramètres de recherche",
    es: "configuraciones de búsqueda",
  },
  "focus search": {
    de: "Suche fokussieren",
    en: "focus searchbar",
    fr: "mettre en évidence la barre de recherche",
    es: "enfocar la barra de búsqueda",
  },
  "search engine": {
    de: "Suchmaschine",
    en: "search engine",
    fr: "moteur de recherche",
    es: "motor de búsqueda",
  },
  "on unsplash": {
    de: "auf",
    en: "on",
    fr: "sur",
    es: "en",
  },
  "select export password": {
    de: "Passwort für die Verschlüsselung eingeben",
    en: "Set password for data encryption",
    fr: "entrez un mot de passe pour chiffrer les données",
    es: "establecer contraseña para la encriptación de datos",
  },
  "import password": {
    de: "Passwort für die Entschlüsselung eingeben",
    en: "Enter password for data decryption",
    fr: "entrez un mot de passe pour déchiffrer les données",
    es: "introducir contraseña para la desencriptación de datos",
  },
  "manually setting input": {
    de: "manuelle Eingabe",
    en: "manual input",
    fr: "saisie manuelle",
    es: "entrada manual",
  },
  "drop file": {
    de: "Datei ablegen",
    en: "drop file",
    fr: "déposer un fichier",
    es: "soltar archivo",
  },
  "no json format": {
    de: "falsches Dateiformat",
    en: "wrong file format",
    fr: "mauvais format de fichier",
    es: "formato de archivo incorrecto",
  },
  online: {
    de: "Online",
    en: "online",
    fr: "en ligne",
    es: "en línea",
  },
  local: {
    de: "Lokal",
    en: "local",
    fr: "local",
    es: "local",
  },
  theme: {
    de: "Thema",
    en: "theme",
    fr: "thème",
    es: "tema",
  },
  light: {
    de: "Hell",
    en: "light",
    fr: "clair",
    es: "claro",
  },
  dark: {
    de: "Dunkel",
    en: "dark",
    fr: "sombre",
    es: "oscuro",
  },
  system: {
    de: "System",
    en: "system",
    fr: "système",
    es: "sistema",
  },
  automatic: {
    de: "automatisch",
    en: "automatic",
    fr: "automatique",
    es: "automático",
  },
  "widget appereance": {
    de: "Widget Design",
    en: "widget appereance",
    fr: "automatique",
    es: "automático",
  },
  "text color": {
    de: "Schriftfarbe",
    en: "text color",
    fr: "automatique",
    es: "automático",
  },
  "text size": {
    de: "Schriftgröße",
    en: "text size",
    fr: "automatique",
    es: "automático",
  },
  "background color": {
    de: "Hintergrundfarbe",
    en: "background color",
    fr: "automatique",
    es: "automático",
  },
  "border radius": {
    de: "Eckenrundung",
    en: "border radius",
    fr: "automatique",
    es: "automático",
  },
  "text shadow": {
    de: "Schriftschatten",
    en: "text shadow",
    fr: "automatique",
    es: "automático",
  },
  font: {
    de: "Schriftart",
    en: "font family",
    fr: "automatique",
    es: "automático",
  },
  "font weight": {
    de: "Schriftstärke",
    en: "font weight",
    fr: "automatique",
    es: "automático",
  },
  "big weight": {
    de: "dick",
    en: "big",
    fr: "automatique",
    es: "automático",
  },
  "medium weight": {
    de: "mittel",
    en: "medium",
    fr: "automatique",
    es: "automático",
  },
  "normal weight": {
    de: "normal",
    en: "normal",
    fr: "automatique",
    es: "automático",
  },
  "thin weight": {
    de: "dünn",
    en: "thin",
    fr: "automatique",
    es: "automático",
  }
};
