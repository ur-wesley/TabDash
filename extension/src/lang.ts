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
    search: "/search",
};

export const searchEngine = [
    {
        name: 'Startpage',
        link: 'https://www.startpage.com/sp/search?q=$s'
    }, {
        name: 'Ecosia',
        link: 'https://www.ecosia.org/search?method=index&q=$s'
    }, {
        name: 'DuckDuckGo',
        link: 'https://duckduckgo.com/?q=$s'
    }
]

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
    "new tab": {
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
        de: "Online speichern?",
        en: "save online?",
    },
    "import": {
        de: "importieren",
        en: "import",
    },
    "export": {
        de: "exportieren",
        en: "export",
    },
    "import cloud": {
        de: "online wiederherstellen",
        en: "Restore from cloud",
    },
    "import local": {
        de: "aus Zwischenablage lesen",
        en: "read settings from clipboard",
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
    "export cloud": {
        de: "online speichern",
        en: "save online",
    },
    "export local": {
        de: "in Zwischenablage schreiben",
        en: "copy to clipboard",
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
    "save to file": {
        de: "in Datei speichern",
        en: "save to file",
    },
    ['setting input']: {
        de: "Einstellungen einfügen",
        en: "setting input",
    },
    reset: {
        de: "Einstellungen zurücksetzen",
        en: "reset settings",
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
    "confirm reset": {
        de: "Alle Einstellungen auf Standard stellen?",
        en: "Reset all settings to default?",
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
    "search settings": {
        de: "Sucheinstellungen",
        en: "search settings",
    },
    "focus search": {
        de: "Suche fokussieren",
        en: "focus searchbar",
    },
    "search engine": {
        de: "Suchmaschine",
        en: "search engine",
    },
    "on unsplash": {
        de: "auf",
        en: "on",
    },
    "select export password": {
        de: "Passwort für die Verschlüsselung eingeben",
        en: "Set password for data encryption"
    },
    "import password": {
        de: "Passwort für die Entschlüsselung eingeben",
        en: "Enter password for data decryption"
    },
    "manually setting input": {
        de: "manuelle Eingabe",
        en: "manual input"
    },
    "drop file": {
        de: "Datei ablegen",
        en: "drop file"
    },
    "no json format": {
        de: "falsches Dateiformat",
        en: "wrong file format"
    },
    "online": {
        de: "Online",
        en: "online"
    },
    "local": {
        de: "Lokal",
        en: "local"
    },
};
