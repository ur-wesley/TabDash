# TabDash — Quelltext & Build (AMO / Firefox)

Diese Anleitung beschreibt, wie aus dem eingereichten Quelltext **exakt** das Firefox-Add-on (`.zip`/`.xpi`) für TabDash **0.4.0** erstellt wird. Der Erweiterungs-Code liegt im Workspace `extension/`; Build-Befehle werden **vom Repository-Root** ausgeführt.

English summary: install [Bun](https://bun.sh), run `bun install`, then `bun scripts/build-firefox-addon.ts`. Output: `extension/bundle/tabdash-firefox.zip`. Extension sources are not minified (`minify: false` in Vite). Third-party code lives in `node_modules/` after install.

## Build-Umgebung

| Anforderung        | Version / Hinweis                                                                |
| ------------------ | -------------------------------------------------------------------------------- |
| **Betriebssystem** | Windows 10+, macOS 12+, oder Linux (x64)                                         |
| **Bun**            | **1.4.2** oder neuer (Package Manager; siehe `packageManager` in `package.json`) |
| **Git**            | Optional; nur zum Klonen des Repositories                                        |
| **Node.js / npm**  | **Nicht erforderlich** — dieses Projekt nutzt ausschließlich **Bun**             |

### Bun installieren

- Windows/macOS/Linux: https://bun.sh/docs/installation
- Prüfen: `bun --version` (≥ 1.4.2)

## Schritt-für-Schritt (exakte Add-on-Kopie)

1. Quelltext-Archiv entpacken (oder Repository klonen) und ins **Root-Verzeichnis** wechseln (dort liegen `package.json` und `extension/`).

2. Abhängigkeiten installieren:

   ```bash
   bun install
   ```

3. **Build-Skript** ausführen (installiert bei Bedarf, baut die Erweiterung, kopiert das Firefox-Manifest, führt `web-ext lint` aus, erzeugt das Paket):

   ```bash
   bun scripts/build-firefox-addon.ts
   ```

4. Ergebnis: **`extension/bundle/tabdash-firefox.zip`** — dieses Archiv entspricht dem Firefox-Upload (Manifest MV3, `browser_specific_settings.gecko.id` für Updates).

### Was das Skript technisch tut

1. `bun install` im Monorepo-Root
2. `bun run --filter @ur-wesley/tabdash-extension build` (Vite; **keine Minifizierung** des Erweiterungs-JS)
3. Schreibt Browser-Manifeste und kopiert `manifest.firefox.json` → `dist/manifest.json`
4. `web-ext lint` und `web-ext build` auf `extension/dist/`

Die Workspaces `companion/` und `backend/` werden für das Add-on **nicht** gebaut.

## Quelltext-Einreichung (Archiv für Mozilla)

Im Repository-Root:

```bash
bun scripts/package-amo-source.ts
```

Erzeugt **`extension/bundle/tabdash-<version>-source.zip`** aus `git archive` (nur versionierte Dateien, ohne `node_modules/`, ohne Build-Artefakte).

## Hinweise für Prüfer

- Lesbarer Quellcode: TypeScript/TSX/SolidJS unter `extension/src/`; Build-Ausgabe in `extension/dist/` wird vom Skript erzeugt.
- Externe Bibliotheken: npm-Registry-Abhängigkeiten in `node_modules/` nach `bun install` (Open Source, nicht im Quelltext-Zip enthalten).
- `host_permissions: ["<all_urls>"]`: wird für Favicon-/Seiten-Icon-Ermittlung bei Shortcuts genutzt, kein Tracking.
