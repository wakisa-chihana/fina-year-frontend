import { baseUrl } from '@/constants/baseUrl';

class BackendConnectionTest {
  private baseUrl: string;

  constructor() {
    this.baseUrl = baseUrl;
  }

  /**
   * Test if the backend is reachable
   */
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log(`Testing connection to: ${this.baseUrl}`);
      
      const response = await fetch(`${this.baseUrl}/docs`, {
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
          message: `Backend returned ${response.status}`,
          details: {
            status: response.status,
            statusText: response.statusText
          }
        };
      }
    } catch (error) {
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
      // Test with a dummy user ID that might not exist
      const testUserId = 999999;
      const response = await fetch(`${this.baseUrl}/notifications/${testUserId}`);
      
      if (response.status === 404) {
        // 404 means the endpoint exists but user not found - this is expected
        return {
          success: true,
          message: 'Notification endpoints are available',
          details: {
            status: response.status,
            message: 'Endpoint exists (returned 404 for non-existent user)'
          }
        };
      } else if (response.status === 200) {
        return {
          success: true,
          message: 'Notification endpoints are working',
          details: {
            status: response.status,
            message: 'Endpoint returned data'
          }
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          message: `Notification endpoint returned ${response.status}`,
          details: {
            status: response.status,
            error: errorText
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Cannot reach notification endpoints',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: `${this.baseUrl}/notifications/`
        }
      };
    }
  }

  /**
   * Test all backend connectivity
   */
  async runAllTests(): Promise<{
    connection: { success: boolean; message: string; details?: any };
    notifications: { success: boolean; message: string; details?: any };
  }> {
    console.log('Running backend connectivity tests...');
    
    const connection = await this.testConnection();
    const notifications = await this.testNotificationEndpoints();
    
    console.log('Connection test:', connection);
    console.log('Notifications test:', notifications);
    
    return {
      connection,
      notifications
    };
  }
}

export const backendTest = new BackendConnectionTest();
export default backendTest;
