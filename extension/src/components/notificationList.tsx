import {
  Component,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { Notification } from '../../types/notification.js';
import Toast from './toast.jsx';

const NotificationList: Component<Prop> = (props) => {
  onMount(() => {
    window.addEventListener('toast', notification);
  });
  onCleanup(() => {
    window.removeEventListener('toast', notification);
  });
  const notification = (e: any) => {
    setToasts([...toasts(), e.detail]);
  };
  const [toasts, setToasts] = createSignal(new Array<Notification>(), {
    equals: false,
  });
  const removeToast = (id: string) => {
    const index = toasts().findIndex((t) => t.id == id);
    if (index > -1) {
      toasts().splice(index, 1);
      setToasts(toasts());
    }
  };
  return (
    <Show when={toasts().length > 0}>
      <Portal>
        <div class='absolute top-0 left-0 md:left-auto w-full md:top-4 md:right-4 z-50 flex flex-col justify-end gap-0 md:gap-2'>
          <For each={toasts()}>
            {(notification) => {
              return <Toast notification={notification} remove={removeToast} />;
            }}
          </For>
        </div>
      </Portal>
    </Show>
  );
};

export default NotificationList;

interface Prop {}
