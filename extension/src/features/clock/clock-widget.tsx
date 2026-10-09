import { Show, createMemo, createSignal, onCleanup } from 'solid-js';
import type { Component } from 'solid-js';
import type { ClockSetting, DateSetting } from '../../../types/settings';
import Time from '../../api/time';

export interface ClockWidgetProps {
  locale: string;
  clockSetting?: ClockSetting;
  dateSetting?: DateSetting;
  showTime?: boolean;
  showDate?: boolean;
}

export const ClockWidget: Component<ClockWidgetProps> = (props) => {
  const showTime = () => props.showTime ?? true,
    showDate = () => props.showDate ?? true,
    timeInstance = createMemo(
      () => new Time(props.locale, props.clockSetting?.showSeconds ?? false, props.dateSetting),
    ),
    [currentTime, setCurrentTime] = createSignal<string>(timeInstance().getTime()),
    [currentDate, setCurrentDate] = createSignal<string>(timeInstance().getDate()),
    timer = setInterval(() => {
      setCurrentTime(timeInstance().getTime());
      setCurrentDate(timeInstance().getDate());
    }, 1000);

  onCleanup(() => {
    clearInterval(timer);
  });

  return (
    <div class="p-4 flex flex-col items-center widget select-none">
      <Show when={showTime()}>
        <span
          class="text-7xl md:text-8xl tracking-tight"
          style={{ 'font-weight': 'var(--weight)' }}
        >
          {currentTime()}
        </span>
      </Show>
      <Show when={showDate()}>
        <span
          class="text-xl md:text-2xl mt-1 opacity-80"
          style={{ 'font-weight': 'var(--weight)' }}
        >
          {currentDate()}
        </span>
      </Show>
    </div>
  );
};
