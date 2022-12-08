import { Component, createMemo, createSignal, onCleanup, Show } from 'solid-js';
import { ClockSetting } from '../../../types/settings.js';
import Time from '../../api/time.js';

const Clock: Component<Prop> = (props) => {
  const c = createMemo(
    () => new Time(props.locale, props.settings.showSeconds ?? false)
  );
  const [clock, setClock] = createSignal<string>(c().getTime());
  const clockIntervall = setInterval(() => setClock(c().getTime()), 1000);
  onCleanup(() => clearInterval(clockIntervall));
  return (
    <div class='p-4 flex flex-col items-center widget'>
      <Show when={props.showTime}>
        <span class='text-8xl font-bold'>{clock()}</span>
      </Show>
      <Show when={props.showDate}>
        <span class='text-2xl font-bold align-middle'>{c().getDate()}</span>
      </Show>
    </div>
  );
};

export default Clock;

interface Prop {
  locale: string;
  settings: ClockSetting;
  showTime?: boolean;
  showDate?: boolean;
}
