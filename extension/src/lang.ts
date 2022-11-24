export const availableLanguages = ["de", "en"] as const;

export type AvailableLanguages = typeof availableLanguages[number];

export const helpLinks = {
    base:
        (import.meta.env.VITE_COMPANION_BASE || "http://localhost:3000") +
        "/docs/",
    general: "/general",
    layout: "/layout",
    background: "/background",
    shortcut: "/shortcut",
    time: "/time",
    date: "/date",
    management: "/management",
    weather: "/weather",
};

export const messages = {
    general: {
        de: "Allgemein",
        en: "general",
    },
    name: {
        de: "Name",
        en: "name",
    },
    locale: {
        de: "Sprache",
        en: "language",
    },
    favicon: {
        de: "Tab Symbol",
        en: "tab icon",
    },
    title: {
        de: "Titel",
        en: "title",
    },
    "browser sync": {
        de: "Browser Synchronisierung",
        en: "browser syncing",
    },
    layout: {
        de: "Layout",
        en: "layout",
    },
    "show clock": {
        de: "Uhrzeit anzeigen",
        en: "show clock",
    },
    "show date": {
        de: "Datum anzeigen",
        en: "show date",
    },
    "show greeting": {
        de: "Gruß anzeigen",
        en: "show greeting",
    },
    greeting: {
        de: "Willkommen",
        en: "welcome",
    },
    "show searchbar": {
        de: "Suchbar anzeigen",
        en: "show searchbar",
    },
    "show weather": {
        de: "Wetter anzeigen",
        en: "show weather",
    },
    "show shortcuts": {
        de: "Schnelllinks anzeigen",
        en: "show shortcuts",
    },
    background: {
        de: "Hintergrund",
        en: "background",
    },
    "bg active": {
        de: "Hintergrund aktiv",
        en: "background active",
    },
    collections: {
        de: "Sammlungen",
        en: "collections",
    },
    backdrop: {
        de: "Hintergrundfilter",
        en: "background filter",
    },
    blur: {
        de: "verwischen",
        en: "blur",
    },
    brightness: {
        de: "Helligkeit",
        en: "brightness",
    },
    saturate: {
        de: "Sättigung",
        en: "saturation",
    },
    "reload img": {
        de: "Bild neu laden",
        en: "reload image",
    },
    color: {
        de: "Farbe",
        en: "color",
    },
    "static img": {
        de: "statisches Bild",
        en: "static Image",
    },
    "shortcut settings": {
        de: "Schnelllink Einstellungen",
        en: "shortcut settings",
    },
    "new shortcut": {
        de: "Schnelllink erstellen",
        en: "create shortcut",
    },
    "shortcuts per line": {
        de: "Schnelllinks pro Reihe",
        en: "shortcuts per row",
    },
    "shortcut size": {
        de: "Größe",
        en: "size",
    },
    "shortcut name": {
        de: "Name",
        en: "name",
    },
    "shortcut link": {
        de: "Adresse",
        en: "link",
    },
    "shortcut icon": {
        de: "Symbol",
        en: "icon",
    },
    "shortcut icon only": {
        de: "nur Symbol",
        en: "icon only",
    },
    "shortcut new tab": {
        de: "im neuen Tab öffnen",
        en: "open in new tab",
    },
    add: {
        de: "Hinzufügen",
        en: "add",
    },
    "time and date": {
        de: "Zeit und Datum",
        en: "time and date",
    },
    "show seconds": {
        de: "Sekunden anzeigen",
        en: "show seconds",
    },
    weather: {
        de: "Wetter",
        en: "weather",
    },
    imperial: {
        de: "Imperial",
        en: "imperial",
    },
    "show weather icon": {
        de: "Wetter Symbol",
        en: "weather icon",
    },
    "show weather text": {
        de: "Wetter beschreibung",
        en: "weather description",
    },
    management: {
        de: "Verwaltung",
        en: "management",
    },
    "setting in cloud": {
        de: "Online speichern",
        en: "save online",
    },
    import: {
        de: "importieren",
        en: "imoport",
    },
    "import success clipboard": {
        de: "Einstellungen wurden erfolgreich aus der Zwischenablage importiert",
        en: "settings successfully copied from clipboard",
    },
    "import success cloud": {
        de: "Einstellungen wurden erfolgreich wiederhergestellt",
        en: "settings were restored successfully",
    },
    "import fail": {
        de: "Einstellungen konnten nicht wiederhergestellt werden",
        en: "settings could not be restored",
    },
    export: {
        de: "exportieren",
        en: "export",
    },
    "export success clipboard": {
        de: "Einstellungen wurden erfolgreich in die Zwischenablage exportiert",
        en: "settings successfully copied to clipboard",
    },
    "export success cloud": {
        de: "Einstellungen wurden erfolgreich gespeichert",
        en: "settings got saved successfully",
    },
    "export fail": {
        de: "Einstellungen konnten nicht exportiert werden",
        en: "settings could not be exported",
    },
    reset: {
        de: "Zurücksetzen",
        en: "reset",
    },
    clipboard: {
        de: "Zwischenablage",
        en: "clipboard",
    },
    search: {
        de: "Suche",
        en: "search",
    },
    save: {
        de: "Speichern",
        en: "save",
    },
    delete: {
        de: "Löschen",
        en: "delete",
    },
    "confirm delete": {
        de: "Löschen bestätigen",
        en: "confirm delete",
    },
    "photo by": {
        de: "Foto von",
        en: "photo by",
    },
    large: {
        de: "Groß",
        en: "large",
    },
    medium: {
        de: "Mittel",
        en: "medium",
    },
    small: {
        de: "Klein",
        en: "small",
    },
    text: {
        de: "Text",
        en: "text",
    },
    "setting id": {
        de: "Einstellung ID",
        en: "setting id",
    },
    "incorrect id": {
        de: "ID hat falsches Format",
        en: "incorrect id formatting",
    },
};
