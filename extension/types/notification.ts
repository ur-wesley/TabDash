export interface Notification {
  id: string;
  msg: string;
  duration?: number;
  type: NotificationType;
}

export type NotificationType = "success" | "error" | "info";

export const sendToast = (
  msg: string,
  type: NotificationType = "info",
  duration: number = 5000
) => {
  const id = crypto.randomUUID().split("-")[0];
  const e = new CustomEvent<Notification>("toast", {
    detail: { id, msg, type, duration },
    bubbles: true,
  });
  window.dispatchEvent(e);
};
