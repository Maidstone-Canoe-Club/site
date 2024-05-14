export type NotificationVariant = "info" | "error" | "success" | "warning"

export type Notification = {
  title: string,
  message?: string,
  variant?: NotificationVariant
}

export function useNotification () {
  const state = useState<Notification[]>("notifications", () => []);

  function newNotification (notification: Notification) {
    state.value.push(notification);
  }

  function clearNotification () {
    if (state.value.length) {
      state.value.shift();
    }
  }

  const notifications = computed<Notification[]>(() => state.value);

  return {
    newNotification,
    notifications: readonly(notifications),
    clearNotification
  };
}
