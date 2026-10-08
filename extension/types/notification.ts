import { toast } from 'solid-sonner';

export interface Notification {
  id: string;
  msg: string;
  duration?: number;
  type: NotificationType;
}

export type NotificationType = 'success' | 'error' | 'info';

export const sendToast = (
  msg: string,
  type: NotificationType = 'info',
  duration: number = 5000,
) => {
  if (type === 'success') {
    toast.success(msg, { duration });
  } else if (type === 'error') {
    toast.error(msg, { duration });
  } else {
    toast.info(msg, { duration });
  }
};
