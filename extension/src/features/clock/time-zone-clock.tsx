import { type Component, For, Show, createSignal, onCleanup } from 'solid-js';

export interface TimeZoneClockProps {
  timeZones?: string[];
  locale?: string;
}

export const TimeZoneClock: Component<TimeZoneClockProps> = (props) => {
  const [now, setNow] = createSignal(new Date());

  const timer = setInterval(() => {
    setNow(new Date());
  }, 1000);

  onCleanup(() => {
    clearInterval(timer);
  });

  const formatTimeZone = (tz: string) => {
    try {
      return new Intl.DateTimeFormat(props.locale ?? 'en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
      }).format(now());
    } catch {
      return '';
    }
  };

  return (
    <Show when={props.timeZones && props.timeZones.length > 0}>
      <div class="flex gap-4 items-center justify-center widget p-2 text-sm">
        <For each={props.timeZones}>
          {(tz) => (
            <div class="flex flex-col items-center">
              <span class="text-xs text-zinc-400">{tz.split('/').pop()?.replace('_', ' ')}</span>
              <span class="font-bold">{formatTimeZone(tz)}</span>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
};
