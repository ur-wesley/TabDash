# TabDash Extension

Browser extension for Chrome, Firefox, and Edge (Manifest V3).

Built with **SolidJS**, **Vite**, **UnoCSS**, and **@kobalte/core** primitives.

## Development

```bash
# Install dependencies from root
bun install

# Start development server
bun --filter @ur-wesley/tabdash-extension dev

# Build production extension package
bun --filter @ur-wesley/tabdash-extension build
```

Generated extension bundles and browser-specific manifests (`manifest.chrome.json`, `manifest.firefox.json`, `manifest.edge.json`) will be emitted into `dist/` and `public/`.
