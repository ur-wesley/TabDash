import { type Component, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import type { Notification } from '../../types/notification.js';
import Toast from './toast.jsx';

const NotificationList: Component = () => {
  const [toasts, setToasts] = createSignal<Notification[]>([], {
    equals: false,
  });

  const handleNotification = (e: Event) => {
    const detail = (e as CustomEvent<Notification>).detail;
    if (detail) {
      setToasts([detail, ...toasts()]);
    }
  };

  onMount(() => {
    window.addEventListener('toast', handleNotification);
  });

  onCleanup(() => {
    window.removeEventListener('toast', handleNotification);
  });

  const removeToast = (id: string) => {
    const index = toasts().findIndex((t) => t.id === id);
    if (index > -1) {
      toasts().splice(index, 1);
      setToasts(toasts());
    }
  };

  return (
    <Show when={toasts().length > 0}>
      <Portal>
        <div class="absolute top-0 left-0 md:left-auto w-full md:top-4 md:right-4 z-50 flex flex-col justify-end gap-0 md:gap-2">
          <For each={toasts()}>
            {(toastItem) => {
              return <Toast notification={toastItem} remove={removeToast} />;
            }}
          </For>
        </div>
      </Portal>
    </Show>
  );
};

export default NotificationList;
