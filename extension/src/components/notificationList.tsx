import {
  Component,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { Notification } from "../../types/notification.js";
import Toast from "./toast.jsx";

const NotificationList: Component<Prop> = (props) => {
  onMount(() => {
    window.addEventListener("toast", notification);
  });
  onCleanup(() => {
    window.removeEventListener("toast", notification);
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
      <div class="absolute top-4 right-4 z-50 flex flex-col justify-end gap-2">
        <For each={toasts()}>
          {(notification) => {
            return <Toast notification={notification} remove={removeToast} />;
          }}
        </For>
      </div>
    </Show>
  );
};

export default NotificationList;

interface Prop {}
