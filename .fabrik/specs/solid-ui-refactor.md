# Solid UI App Refactoring Specification

## Overview & Objective

Refactor the TabDash browser extension (`extension/`) to strictly follow the `solidjs-ui` skill guidelines:

- Primitive layer in `components/ui/*` using `@kobalte/core` and `cva`.
- Iconography using `i-mdi-*` via UnoCSS Iconify preset.
- Service layer in `services/*` using `@ur-wesley/ts-prelude/<subpath>` (`/result`, `/option`, etc.) with `ResultAsync`.
- Centralized reactive context stores exposing `readonly [state, actions]` tuples (migrating away from raw NanoStores component bindings).
- Modular feature packages in `features/*` (`clock`, `weather`, `search`, `greeting`, `background`, `shortcuts`, `settings`).
- Accessible, non-mutating UI components (eliminating direct prop mutation in shortcuts and manual window event buses).
- Replaced custom toast system with `solid-sonner`.
- Clean root composition in `App.tsx` passing all quality gates (`bun run check`, `bun test`, `bun run build`).

---

## Architecture & Target File Tree

```
extension/src/
├── components/
│   └── ui/                     # Domain-agnostic UI atoms (solid-ui layer)
│       ├── button.tsx          # cva variants (primary, destructive, outline, ghost, secondary)
│       ├── input.tsx           # Accessible text input with label & error slots
│       ├── select.tsx          # Kobalte Select wrapper with i-mdi-* icons
│       ├── switch.tsx          # Kobalte Switch primitive
│       ├── slider.tsx          # Kobalte Slider primitive with value tooltip/label
│       ├── sheet.tsx           # Kobalte Dialog sheet primitive for slide-over sidebars
│       ├── popover.tsx         # Kobalte Popover primitive (replaces ad-hoc floating menus)
│       ├── tabs.tsx            # Kobalte Tabs primitive
│       ├── color-picker.tsx    # Accessible color picker primitive
│       └── file-input.tsx      # Standardized file import button
├── features/
│   ├── clock/
│   │   ├── clock-widget.tsx    # Clock display
│   │   └── time-zone-clock.tsx # Multi-timezone clock
│   ├── weather/
│   │   ├── weather-widget.tsx  # Weather display with explicit loading/error/success states
│   │   └── weather-context.tsx # readonly [state, actions] provider
│   ├── shortcuts/
│   │   ├── shortcut-grid.tsx   # Responsive shortcuts grid
│   │   ├── shortcut-item.tsx   # Accessible shortcut card/link
│   │   └── shortcut-popover.tsx# Popover editor (replaces prop mutation)
│   ├── search/
│   │   └── search-bar.tsx      # Search bar with provider selector & i-mdi-magnify
│   ├── background/
│   │   ├── background-layer.tsx# Wallpaper image / color canvas & backdrop filter
│   │   └── author-credit.tsx   # Unsplash attribution badge
│   ├── greeting/
│   │   └── greeting-widget.tsx # Localized greeting headline
│   └── settings/
│       ├── settings-sheet.tsx  # Slide-over sidebar container
│       ├── settings-context.tsx# readonly [state, actions] context
│       ├── category-section.tsx# Accessible settings category grouping
│       ├── appearance-tab.tsx  # Widget appearance customization
│       └── management-tab.tsx  # Import/Export/Cloud sync actions
├── services/                   # Side-effects and APIs (ts-prelude ResultAsync)
│   ├── weather-service.ts      # OpenWeather API client using ResultAsync
│   ├── wallpaper-service.ts    # Unsplash buffer & rotation using ResultAsync
│   ├── storage-service.ts      # Chrome & LocalStorage adapter using ResultAsync
│   └── sync-service.ts         # Nitro cloud sync client using ResultAsync
├── lib/
│   ├── utils.ts                # cn() helper (tailwind-merge + clsx)
│   └── i18n.tsx                # @solid-primitives/i18n provider & hook
├── App.tsx                     # Root composition, Providers, <Toaster />
└── main.tsx
```

---

## Task Breakdown (Beads Issues)

1. **[TABDASH-01] Add solid-ui prerequisites (`cva`, `solid-sonner`) and `components/ui` primitives**
2. **[TABDASH-02] Build `ts-prelude` service layer and `readonly [state, actions]` context stores**
3. **[TABDASH-03] Migrate feature widgets to `features/*` and refactor shortcuts menu**
4. **[TABDASH-04] Migrate settings panel and replace toasts with `solid-sonner`**
5. **[TABDASH-05] Assemble `App.tsx` and run lint, format, and build gates**
