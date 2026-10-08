# More Widgets Specification: TabDash Dashboard Suite

## 1. Executive Summary & Objective

TabDash currently supports 5 primary visual widgets on the dashboard:

1. Clock (Time & Date)
2. Greeting
3. Weather
4. Searchbar
5. Shortcuts

This specification introduces a modular suite of new, highly requested widgets to elevate TabDash into a customizable dashboard:

1. **Todo List Widget (`TodoList`)**: Daily task management with checkboxes, active/completed states, add/delete, and local persistence.
2. **Quick Notes Widget (`QuickNotes`)**: Scratchpad for instant thoughts and memo storage with auto-save.
3. **Pomodoro / Focus Timer Widget (`PomodoroTimer`)**: Focus session countdown (25m / 5m / 15m), start/pause/reset, and visual progress indicator.
4. **Daily Quotes & Motivation Widget (`DailyQuote`)**: Offline-first curated quotes library with author attribution and refresh action.
5. **World Clocks Widget (`WorldClock`)**: Multi-timezone clocks for global teams and remote workers.
6. **Mini Calendar Widget (`MiniCalendar`)**: Compact monthly calendar view highlighting today with previous/next month navigation.

All widgets adhere to TabDash's SolidJS + Kobalte primitives + UnoCSS styling and inherit global widget styling (font, font weight, background blur, rounded corners, backdrop filters, text shadow).

---

## 2. Architecture & Data Model

### 2.1 Settings Schema Extensions (`extension/types/settings.ts`)

```typescript
export interface LayoutSetting {
  showClock: boolean;
  showDate: boolean;
  showGreeting: boolean;
  showSearchbar: boolean;
  showShortcuts: boolean;
  showWeather: boolean;
  // New widget visibility toggles:
  showTodos?: boolean;
  showNotes?: boolean;
  showPomodoro?: boolean;
  showQuotes?: boolean;
  showWorldClock?: boolean;
  showCalendar?: boolean;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface TodoSetting {
  items: TodoItem[];
}

export interface NotesSetting {
  content: string;
  updatedAt: number;
}

export interface PomodoroSetting {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  soundEnabled: boolean;
}

export interface QuoteSetting {
  category: 'all' | 'inspirational' | 'wisdom' | 'code';
  showAuthor: boolean;
}

export interface WorldClockSetting {
  timeZones: string[];
}

export interface CalendarSetting {
  firstDayOfWeek: 'monday' | 'sunday';
}
```

### 2.2 Feature Directory Layout

```
extension/src/features/
├── todos/
│   ├── todo-widget.tsx
│   ├── todo-widget.test.ts
│   └── todo-store.ts
├── notes/
│   ├── notes-widget.tsx
│   ├── notes-widget.test.ts
│   └── notes-store.ts
├── pomodoro/
│   ├── pomodoro-widget.tsx
│   ├── pomodoro-widget.test.ts
│   └── pomodoro-timer.ts
├── quotes/
│   ├── quote-widget.tsx
│   ├── quote-widget.test.ts
│   └── quotes-data.ts
├── clock/
│   └── time-zone-clock.tsx (wired up to settings)
└── calendar/
    ├── calendar-widget.tsx
    └── calendar-widget.test.ts
```

---

## 3. Widget Specifications

### 3.1 Todo List (`features/todos/todo-widget.tsx`)

- Collapsible or card container with standard widget background and backdrop filter.
- Input bar to type and press Enter to append tasks.
- Checkbox toggle with strike-through completed styling.
- Delete button on hover / focus.
- Footer with count of remaining items and "Clear completed" action.

### 3.2 Quick Notes (`features/notes/notes-widget.tsx`)

- Card with header "Quick Notes" and character / word count.
- Auto-growing / scrollable textarea with subtle scrollbar styling.
- Debounced auto-save (300ms) to settings store.

### 3.3 Pomodoro Timer (`features/pomodoro/pomodoro-widget.tsx`)

- Modes: Work (25m), Short Break (5m), Long Break (15m).
- Large circular progress or digital display showing remaining time `MM:SS`.
- Controls: Play / Pause, Skip / Reset, Mode tabs.
- Subtle Web Audio API chime / beep on timer finish.

### 3.4 Daily Quote (`features/quotes/quote-widget.tsx`)

- Curated JSON dataset bundled offline (~50 inspiring quotes from thinkers, scientists, creators).
- Rotates daily based on date hash, or on-click refresh button.
- Clean typography respecting widget appearance font and text shadow.

### 3.5 World Clock (`features/clock/time-zone-clock.tsx`)

- Displays 1-4 customizable time zones (e.g. UTC, New York, London, Tokyo).
- Digital time with AM/PM or 24h format and day offset indicator (+1d / -1d).

### 3.6 Mini Calendar (`features/calendar/calendar-widget.tsx`)

- 7x6 month grid highlighting today.
- Previous / Next month navigation with Return to Today button.

---

## 4. Settings Panel Integration

1. **Widgets Settings Section**:
   - Visibility toggles for each new widget.
   - Dedicated configuration accordions / tabs:
     - World Clock: Timezone selector multiselect.
     - Pomodoro: Durations (work, short break, long break).
     - Quotes: Category filter.
2. **Translations (`lang.ts`)**:
   - Full localized translations across English, German, French, and Spanish (`de`, `en`, `fr`, `es`).

---

## 5. Phased Rollout Plan

- **Phase 1 (Productivity Core)**: Todo List, Quick Notes, Pomodoro Timer.
- **Phase 2 (Information & Time)**: Daily Quotes, World Clocks, Mini Calendar.
- **Phase 3 (Dashboard Layout & Settings)**: Settings toggles, configuration panels, translations, and tests.

---

## 6. Verification & Quality Gates

- `bun test`: Unit tests for every new widget and store helper.
- `bun run --filter @ur-wesley/tabdash-extension build`: Extension builds cleanly.
- `bun run check`: Formatting and linting checks pass.
