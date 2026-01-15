type NotificationType = 'success' | 'error' | 'info' | 'confirm';

interface NotificationButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface NotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  buttons?: NotificationButton[];
}

type NotificationListener = (options: NotificationOptions) => void;

class GlobalNotificationService {
  private listeners: NotificationListener[] = [];

  subscribe(listener: NotificationListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  show(options: NotificationOptions) {
    this.listeners.forEach(listener => listener(options));
  }
}

export const globalNotificationService = new GlobalNotificationService();
