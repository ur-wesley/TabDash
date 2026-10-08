import type { Component, JSX } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import type { AvailableLanguages } from './lang';
import { CanvasContainer } from './components/canvas/CanvasContainer';
import { CanvasToolbar } from './components/canvas/CanvasToolbar';
import { Toaster } from './components/ui/sonner';
import { AuthorCredit } from './features/background/author-credit';
import { BackgroundLayer } from './features/background/background-layer';
import { useDashboardLayout } from './features/dashboard/use-dashboard-layout';
import { useDashboardSync } from './features/dashboard/use-dashboard-sync';
import { useDashboardWidgets } from './features/dashboard/use-dashboard-widgets';
import { usePerWidgetAutoContrast } from './features/widgets/use-per-widget-auto-contrast';
import { defaultFlowOrder, defaultPositions } from './features/layout/layout-defaults';
import { SettingsProvider, useSettingsContext } from './features/settings/settings-context';
import { ThemeProvider } from './features/theme/theme-store';
import { SettingsSheet } from './features/settings/settings-sheet';
import { WeatherProvider } from './features/weather/weather-context';
import { I18nProvider } from './i18n';

const [currentLocale, setCurrentLocale] = createSignal<AvailableLanguages>('en');

const Dashboard: Component = () => {
  const [state] = useSettingsContext();
  const [isEditingLayout, setIsEditingLayout] = createSignal(false);

  useDashboardSync();
  usePerWidgetAutoContrast();
  const layout = useDashboardLayout();
  const widgetsList = useDashboardWidgets(isEditingLayout);

  return (
    <div class="h-screen w-screen overflow-hidden relative">
      <BackgroundLayer
        background={state.background}
        backdrop={state.background?.backdropActive ? state.background.backdrop : undefined}
      />

      <div
        id="content"
        class="h-full w-full overflow-hidden relative z-10 transition-transform duration-300"
      >
        <CanvasContainer
          mode={state.layout?.mode ?? 'canvas'}
          isEditing={isEditingLayout()}
          snapToGrid={state.layout?.snapToGrid ?? true}
          gridSize={state.layout?.gridSize ?? 5}
          positions={state.layout?.canvasPositions ?? defaultPositions()}
          flowOrder={state.layout?.flowOrder ?? defaultFlowOrder()}
          widgets={widgetsList()}
          onPositionChange={layout.handlePositionChange}
          onMoveFlowOrder={layout.handleMoveFlowOrder}
        />
      </div>

      <CanvasToolbar
        isEditing={isEditingLayout()}
        snapToGrid={state.layout?.snapToGrid ?? true}
        mode={state.layout?.mode ?? 'canvas'}
        onToggleEditing={() => setIsEditingLayout((prev) => !prev)}
        onToggleSnap={layout.handleToggleSnap}
        onToggleMode={layout.handleToggleMode}
        onReset={layout.handleReset}
      />

      <Show when={state.background?.active && state.background?.image?.author}>
        <AuthorCredit information={state.background.image} />
      </Show>

      <SettingsSheet onCustomizeLayout={() => setIsEditingLayout(true)} />

      <Toaster />
    </div>
  );
};

const App: Component = () => {
  return (
    <I18nProvider locale={currentLocale()} onLocaleChange={setCurrentLocale}>
      <SettingsProvider>
        <WeatherRoot>
          <Dashboard />
        </WeatherRoot>
      </SettingsProvider>
    </I18nProvider>
  );
};

const WeatherRoot: Component<{ children: JSX.Element }> = (props) => {
  const [state] = useSettingsContext();
  return (
    <WeatherProvider
      unit={state.weather?.unit ?? 'metric'}
      lang={state.general?.locale ?? 'en'}
      autoFetch
    >
      <ThemeProvider>{props.children}</ThemeProvider>
    </WeatherProvider>
  );
};

export default App;
