import { baseUrl } from '@/constants/baseUrl';
import { toast } from 'react-toastify';

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationCreate {
  user_id: number;
  message: string;
}

class NotificationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch all notifications for a user
   */
  async getUserNotifications(userId: number): Promise<Notification[]> {
    try {
      const url = `${baseUrl}/notifications/${userId}`;
      console.log('Fetching notifications from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch notifications: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.error('Base URL:', this.baseUrl);
      console.error('User ID:', userId);
      throw error;
    }
  }

  /**
   * Send a new notification
   */
  async sendNotification(notification: NotificationCreate): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${baseUrl}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${baseUrl}/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Trigger notification for coaches about missing player performance
   */
  async notifyMissingPerformance(): Promise<{ message: string }> {
    try {
      const response = await fetch(`${baseUrl}/notifications/notify_missing_performance`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to notify missing performance: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error notifying missing performance:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: number): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId);
      return notifications.filter(notif => !notif.is_read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId);
      const unreadNotifications = notifications.filter(notif => !notif.is_read);
      
      const promises = unreadNotifications.map(notif => this.markAsRead(notif.id));
      await Promise.all(promises);
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  }

  /**
   * Format notification date for display
   */
  formatNotificationDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Get notification type/priority based on message content
   */
  getNotificationType(message: string): 'info' | 'warning' | 'error' | 'success' {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('error') || lowerMessage.includes('failed')) {
      return 'error';
    }
    if (lowerMessage.includes('warning') || lowerMessage.includes('missing') || lowerMessage.includes('no')) {
      return 'warning';
    }
    if (lowerMessage.includes('success') || lowerMessage.includes('completed') || lowerMessage.includes('updated')) {
      return 'success';
    }
    
    return 'info';
  }

  /**
   * Test if the backend is reachable
   */
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    console.log('Testing connection to:', this.baseUrl);
    
    try {
      // Test basic connection
      const response = await fetch(`${baseUrl}/docs`, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      
      if (response.ok) {
        return {
          success: true,
          message: 'Backend is reachable',
          details: {
            status: response.status,
            url: `${this.baseUrl}/docs`
          }
        };
      } else {
        return {
          success: false,
          message: `Backend responded with status ${response.status}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            url: `${this.baseUrl}/docs`
          }
        };
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        message: 'Cannot connect to backend',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          baseUrl: this.baseUrl
        }
      };
    }
  }

  /**
   * Test if notification endpoints are available
   */
  async testNotificationEndpoints(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Test with a non-existent user ID to see if endpoint exists
      const response = await fetch(`${baseUrl}/notifications/999999`);
      
      if (response.status === 404) {
        // This means the endpoint exists but user not found - which is expected
        return {
          success: true,
          message: 'Notification endpoints are available',
          details: {
            status: response.status,
            message: 'Endpoint exists (404 is expected for non-existent user)'
          }
        };
      } else if (response.status === 500) {
        return {
          success: false,
          message: 'Notification endpoints have server errors',
          details: {
            status: response.status,
            message: 'Server error - check backend logs'
          }
        };
      } else {
        return {
          success: true,
          message: 'Notification endpoints are responding',
          details: {
            status: response.status
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Cannot reach notification endpoints',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: `${this.baseUrl}/notifications/999999`
        }
      };
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
