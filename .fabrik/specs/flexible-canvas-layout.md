# Flexible Canvas Layout Design Specification

## 1. Summary

Transform TabDash's rigid single-column dashboard layout into a flexible 2D canvas and custom ordering system. Users will be able to freely arrange, order, and drag dashboard widgets (`clock`, `greeting`, `searchbar`, `weather`, `shortcuts`) anywhere across the viewport using responsive percentage-based coordinates with optional grid snapping, toggle between Free Canvas and Flow modes, and customize their layout directly on the screen or via the settings sidebar.

```
+-----------------------------------------------------------------------+
|  TabDash Canvas Mode                                                  |
|                                                                       |
|   [Clock & Date]                                       [Weather]      |
|    (x: 25%, y: 20%)                                 (x: 85%, y: 15%)  |
|                                                                       |
|                          [Greeting]                                   |
|                       (x: 50%, y: 40%)                                |
|                                                                       |
|                         [Searchbar]                                   |
|                       (x: 50%, y: 52%)                                |
|                                                                       |
|                         [Shortcuts]                                   |
|                       (x: 50%, y: 72%)                                |
|                                                                       |
| [Toolbar: ✏️ Edit Layout | 🧲 Snap to Grid | 🔄 Reset | ✅ Done]   ⚙️ |
+-----------------------------------------------------------------------+
```

---

## 2. Files to Touch

1. `extension/types/settings.ts` - Extend `LayoutSetting` with `mode: 'canvas' | 'flow'`, `WidgetCanvasPosition`, `canvasPositions`, and `flowOrder`.
2. `extension/public/defaultSettings.json` - Seed default balanced `canvasPositions`, `mode`, and `flowOrder`.
3. `extension/src/api/settingStore.ts` - Add layout mutation helpers (`updateWidgetPosition`, `setLayoutMode`, `resetLayoutPositions`) with auto-persistence.
4. `extension/src/components/canvas/CanvasContainer.tsx` - Main layout container rendering either canvas-positioned items or flow-ordered widgets.
5. `extension/src/components/canvas/CanvasItem.tsx` - Draggable widget wrapper with pointer events, viewport bounds clamping (`5%` - `95%`), and grid snapping.
6. `extension/src/components/canvas/CanvasToolbar.tsx` - Floating action bar active during layout customization (Snap toggle, Reset, Done).
7. `extension/src/components/settingContent.tsx` & `extension/src/components/settings/widgetsSection.tsx` - Add dedicated "Layout" section with mode toggle, "Customize on Canvas" button, and widget visibility toggles.
8. `extension/src/App.tsx` - Replace rigid flex container with `CanvasContainer` and connect edit mode state.
9. `extension/src/lang.ts` - Add localization strings (`de`, `en`, `fr`, `es`) for canvas layout, snapping, and editing actions.
10. `extension/src/components/canvas/canvasLayout.test.ts` - Unit tests for coordinate clamping, snapping calculations, and layout store persistence.

---

## 3. Minimal Steps

1. **Define Layout Data Model**: Update `extension/types/settings.ts` with `WidgetCanvasPosition`, `WidgetId`, and extend `LayoutSetting` with backwards-compatible defaults.
2. **Configure Defaults**: Add default canvas coordinates to `extension/public/defaultSettings.json` and helper functions in `extension/src/api/settingStore.ts`.
3. **Build Canvas Drag Engine**: Create `CanvasItem.tsx` using native SolidJS pointer events (`pointerdown`, `pointermove`, `pointerup`), percentage coordinates (`left: x%`, `top: y%`, `transform: translate(-50%, -50%)`), and boundary clamping.
4. **Build Canvas Toolbar**: Create `CanvasToolbar.tsx` with controls for toggling snap-to-grid, resetting to default layout, and exiting edit mode.
5. **Build Canvas Container**: Create `CanvasContainer.tsx` rendering active widgets in either free canvas coordinates or linear flow order.
6. **Integrate into App**: Update `extension/src/App.tsx` to mount `CanvasContainer` and provide an edit layout button.
7. **Add Layout Settings UI**: Add layout controls in settings with mode selection, snap settings, and widget toggles.
8. **Add i18n Translations**: Add layout-related strings across English, German, French, and Spanish in `extension/src/lang.ts`.
9. **Verify & Test**: Write unit tests in `canvasLayout.test.ts` covering coordinate bounds and snapping, run `bun test` and `bun run check`.

---

## 4. Risks & Non-Goals

- **Risks**:
  - _Resolution variance_: Absolute pixel coordinates break across screen resolutions. **Mitigation**: Use percentage coordinates (`x: 0-100%`, `y: 0-100%`) with center anchoring `translate(-50%, -50%)`.
  - _Input conflict_: Draggable widgets interfering with typing or clicking shortcuts. **Mitigation**: Dragging is strictly enabled only when the user explicitly enters "Layout Edit Mode".
- **Non-Goals**:
  - Heavy external drag-and-drop npm dependencies (keeps bundle small, fast, and native SolidJS).
  - Arbitrary custom HTML widgets (only the supported TabDash widgets: clock, greeting, searchbar, weather, shortcuts).
