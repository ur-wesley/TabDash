import { toast } from 'solid-sonner';

const DEFAULT_TOAST_DURATION_MS = 5000;

interface Notification {
  id: string;
  msg: string;
  duration?: number;
  type: NotificationType;
}

type NotificationType = 'success' | 'error' | 'info';

const sendToast = (
  msg: string,
  type: NotificationType = 'info',
  duration: number = DEFAULT_TOAST_DURATION_MS,
): void => {
  if (type === 'success') {
    toast.success(msg, { duration });
  } else if (type === 'error') {
    toast.error(msg, { duration });
  } else {
    toast.info(msg, { duration });
  }
};

export type { Notification, NotificationType };
export { sendToast };
