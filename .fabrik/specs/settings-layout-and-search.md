# Settings Layout Redesign and Global Search Specification

## Objective

Update the Tabdash browser extension settings panel layout to be logical, user-friendly, and maintainable, eliminating the fragmented 11-category vertical scroll list. Implement a fast global search capable of filtering settings across all categories with in-place controls.

## Problem Statement

The current settings panel stacks 11 separate categories vertically in a single scrollable pane. Key widget settings are disconnected from their visibility toggles (e.g. Clock visibility in "Layout" vs Seconds in "Time and date", Weather visibility in "Layout" vs Weather options in "Weather"). Users must scroll through hundreds of lines to find specific options, with no search capability.

## Target Architecture

### 1. Tabbed Categorization

Settings will be divided into 4 primary views:

1. **General (`general`)**: Profile username, Tab title, Tab favicon, Language/locale, Theme (light/dark/system/auto), Browser cloud sync.
2. **Widgets (`widgets`)**: Consolidated widget cards pairing visibility toggles with widget-specific options:
   - Clock & Date (Show clock, Show date, Show seconds)
   - Search (Show searchbar, Search engine, Auto-focus, Open in new tab)
   - Weather (Show weather, Icon, Text description, Metric/Imperial)
   - Greeting (Show greeting)
   - Shortcuts (Show shortcuts, Display style [icon only, size, per row], Add shortcut form)
3. **Appearance (`appearance`)**:
   - Wallpaper / Background (Unsplash toggle, Collections, Static image URL, Color picker, Reload button, Backdrop blur/brightness/saturation)
   - Widget Theme Customization (Light/Dark tabs, text colors/sizes, background colors, border radius, text shadow, font, backdrop filters)
4. **Data & About (`data`)**:
   - Management (Clipboard, Cloud, File import/export, Reset)
   - About / Footer (version, docs, repository links)

### 2. Global Search

- Positioned at the top of the settings sidebar.
- Live reactive matching across labels, categories, subcategories, and English/German keywords.
- When searching, renders matching controls with category breadcrumb badges.
- Allows in-place editing of values directly from search results.
- `Escape` key or clear button immediately restores normal tab view.

### 3. File Plan

- `extension/src/lang.ts`: Add new localized keys (`appearance`, `widgets`, `data & backup`, `search settings placeholder`, `no settings found`, `clear search`, `results found`).
- `extension/src/components/settings/searchIndex.ts`: Search metadata registry & matching function.
- `extension/src/components/settings/searchBar.tsx`: Accessible search input component.
- `extension/src/components/settings/generalSection.tsx`: General settings tab.
- `extension/src/components/settings/widgetsSection.tsx`: Consolidated widgets tab.
- `extension/src/components/settings/appearanceSection.tsx`: Wallpaper & widget styling tab.
- `extension/src/components/settings/dataSection.tsx`: Data management & about tab.
- `extension/src/components/settings/searchResultsView.tsx`: Interactive search results view.
- `extension/src/components/settingContent.tsx`: Settings coordinator orchestrating search & tabs.
- `extension/src/components/settings/searchIndex.test.ts`: Unit test for search index matching.

## Verification

- `bun test` passes (including i18n dictionary completeness & search index tests).
- `bun run --filter @ur-wesley/tabdash-extension build` passes without errors.
