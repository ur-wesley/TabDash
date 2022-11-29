import { Component, createEffect, createSignal, onCleanup } from 'solid-js';
import { Notification, NotificationType } from '../../types/notification.js';

const Toast: Component<Prop> = (props) => {
  const notificationStyle = (type: NotificationType): string => {
    switch (type) {
      case 'success':
        return 'bg-green-400/20 text-black';
      case 'error':
        return 'bg-red-400/20 text-black';
      case 'info':
        return 'bg-blue-400/20 text-black';
      default:
        return 'bg-blue-400/20 text-black';
    }
  };

  const barStyle = (type: NotificationType): string => {
    switch (type) {
      case 'success':
        return 'bg-green-800';
      case 'error':
        return 'bg-red-800';
      case 'info':
        return 'bg-blue-800';
      default:
        return 'bg-blue-800';
    }
  };

  let intervall: any;
  const [duration, setDuration] = createSignal(
    props.notification.duration || 5000
  );
  createEffect(() => {
    width = 100;
    intervall = setInterval(() => {
      if (duration() > 0) setDuration(duration() - 10);
      else {
        props.remove(props.notification.id);
        clearInterval(intervall);
      }
    }, 10);
  });
  onCleanup(() => clearInterval(intervall));
  let width = 100;
  const barWidth = () => {
    width = (100 / (props.notification.duration || 5000)) * duration();
    return `${width.toFixed(1)}%`;
  };
  return (
    <div
      class={`${notificationStyle(
        props.notification.type
      )} px-4 py-2 block backdrop-blur-md top-0 rounded-lg relative w-64 flex-wrap flex flex-col overflow-hidden self-end`}
    >
      <span>{props.notification.msg}</span>
      <button
        class='border-none bg-transparent absolute top-0 right-0 cursor-pointer p-1'
        onclick={() => props.remove(props.notification.id)}
      >
        x
      </button>
      <div
        class={`h-1 transition absolute bottom-0 left-0 rounded-lg ${barStyle(
          props.notification.type
        )}`}
        style={{
          width: barWidth(),
        }}
      ></div>
    </div>
  );
};

export default Toast;

interface Prop {
  notification: Notification;
  remove: (id: string) => void;
}
