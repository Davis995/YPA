// Real-time Notification Service for Restaurant Management
// Handles notifications across admin, kitchen, and customer interfaces
import React from 'react';

export interface NotificationData {
  id: string;
  type: 'waiter_request' | 'new_order' | 'order_status' | 'payment_success';
  title: string;
  message: string;
  tableId?: string;
  orderId?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  data?: any;
}

class NotificationService {
  private notifications: NotificationData[] = [];
  private listeners: Array<(notification: NotificationData) => void> = [];

  /**
   * Add a notification listener
   */
  subscribe(callback: (notification: NotificationData) => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Send a notification to all listeners
   */
  notify(notification: Omit<NotificationData, 'id' | 'timestamp'>) {
    const fullNotification: NotificationData = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.notifications.unshift(fullNotification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(fullNotification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });

    // Auto-remove notification after 10 seconds for non-urgent items
    if (notification.priority !== 'urgent') {
      setTimeout(() => {
        this.removeNotification(fullNotification.id);
      }, 10000);
    }
  }

  /**
   * Remove a notification
   */
  removeNotification(id: string) {
    this.notifications = this.notifications.filter(notif => notif.id !== id);
  }

  /**
   * Get all notifications
   */
  getNotifications(): NotificationData[] {
    return [...this.notifications];
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: NotificationData['type']): NotificationData[] {
    return this.notifications.filter(notif => notif.type === type);
  }

  /**
   * Clear all notifications
   */
  clearNotifications() {
    this.notifications = [];
  }

  /**
   * Send waiter request notification
   */
  notifyWaiterRequest(tableId: string, message: string) {
    this.notify({
      type: 'waiter_request',
      title: `Table ${tableId} Needs Assistance`,
      message: message,
      tableId,
      priority: 'high',
      data: { tableId, message }
    });
  }

  /**
   * Send new order notification
   */
  notifyNewOrder(tableId: string, orderId: number, total: number) {
    this.notify({
      type: 'new_order',
      title: `New Order from Table ${tableId}`,
      message: `Order #${orderId} - UGX ${total.toLocaleString()}`,
      tableId,
      orderId,
      priority: 'urgent',
      data: { tableId, orderId, total }
    });
  }

  /**
   * Send order status notification
   */
  notifyOrderStatus(tableId: string, orderId: number, status: string, message: string) {
    const priorityMap = {
      confirmed: 'medium',
      preparing: 'medium',
      ready: 'high',
      delivered: 'low'
    };

    this.notify({
      type: 'order_status',
      title: `Order #${orderId} Status Update`,
      message: message,
      tableId,
      orderId,
      priority: priorityMap[status as keyof typeof priorityMap] || 'medium',
      data: { tableId, orderId, status }
    });
  }

  /**
   * Send payment success notification
   */
  notifyPaymentSuccess(tableId: string, orderId: number, paymentMethod: string, amount: number) {
    this.notify({
      type: 'payment_success',
      title: `Payment Successful - Table ${tableId}`,
      message: `${paymentMethod} payment of UGX ${amount.toLocaleString()} completed`,
      tableId,
      orderId,
      priority: 'medium',
      data: { tableId, orderId, paymentMethod, amount }
    });
  }

  /**
   * Play notification sound (if supported)
   */
  playNotificationSound(priority: NotificationData['priority']) {
    try {
      // Create audio context for notification sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const frequencies = {
        low: 400,
        medium: 600,
        high: 800,
        urgent: 1000
      };

      const frequency = frequencies[priority];
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not supported:', error);
    }
  }

  /**
   * Show browser notification (if permitted)
   */
  async showBrowserNotification(notification: NotificationData) {
    if ('Notification' in window) {
      let permission = Notification.permission;
      
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/restaurant-icon.png', // Add your restaurant icon
          badge: '/notification-badge.png',
          tag: notification.type,
          requireInteraction: notification.priority === 'urgent',
          silent: notification.priority === 'low'
        });

        // Auto-close after 5 seconds unless urgent
        if (notification.priority !== 'urgent') {
          setTimeout(() => {
            browserNotification.close();
          }, 5000);
        }

        return browserNotification;
      }
    }
    return null;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Helper hook for React components
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<NotificationData[]>([]);

  React.useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
      
      // Play sound for high priority notifications
      if (notification.priority === 'high' || notification.priority === 'urgent') {
        notificationService.playNotificationSound(notification.priority);
      }

      // Show browser notification
      notificationService.showBrowserNotification(notification);
    });

    // Load existing notifications
    setNotifications(notificationService.getNotifications().slice(0, 10));

    return unsubscribe;
  }, []);

  const clearNotifications = () => {
    notificationService.clearNotifications();
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    notificationService.removeNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    clearNotifications,
    removeNotification
  };
};

export default NotificationService;
