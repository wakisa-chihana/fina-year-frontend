# Notification System Documentation

## Overview

The notification system provides a comprehensive solution for sending, managing, and displaying notifications in the Sports Analytics application. It includes a dropdown component, service layer, and backend API integration.

## Features

- **Real-time Notifications**: Dropdown with live notification updates
- **Notification Management**: Mark as read, delete, and bulk operations
- **Service Layer**: Centralized notification handling with error management
- **Responsive Design**: Mobile-friendly notification dropdown
- **Type Safety**: Full TypeScript support with proper interfaces
- **Toast Integration**: Success/error feedback with react-toastify
- **Automatic Refresh**: Notifications refresh when dropdown is opened

## Components

### NotificationDropdown

Location: `components/notifications/NotificationDropdown.tsx`

A dropdown component that displays notifications with actions to mark as read or delete.

**Props:**
```typescript
interface NotificationDropdownProps {
  userId?: number; // Optional user ID (defaults to cookie value)
}
```

**Features:**
- Unread count badge
- Mark individual notifications as read
- Delete individual notifications
- Mark all notifications as read
- Time-based formatting (e.g., "5m ago", "2h ago")
- Loading states and error handling

### DashboardTopBar (Updated)

Location: `components/dashboard/DashboardTopBar.tsx`

Updated to include the NotificationDropdown component in the top navigation.

**Changes:**
- Replaced static notification icon with interactive dropdown
- Integrated notification service
- Maintained existing styling and animations

## Services

### NotificationService

Location: `services/notificationService.ts`

A comprehensive service class for managing all notification operations.

**Methods:**

#### `getUserNotifications(userId: number): Promise<Notification[]>`
Fetches all notifications for a specific user.

#### `sendNotification(notification: NotificationCreate): Promise<{success: boolean, message: string}>`
Sends a new notification to a user.

#### `markAsRead(notificationId: number): Promise<{success: boolean, message: string}>`
Marks a specific notification as read.

#### `deleteNotification(notificationId: number): Promise<{success: boolean, message: string}>`
Deletes a specific notification.

#### `notifyMissingPerformance(): Promise<{message: string}>`
Triggers notifications for coaches about players with missing performance data.

#### `getUnreadCount(userId: number): Promise<number>`
Gets the count of unread notifications for a user.

#### `markAllAsRead(userId: number): Promise<void>`
Marks all notifications as read for a user.

#### `formatNotificationDate(dateString: string): string`
Formats notification dates for display (e.g., "5m ago", "2h ago").

#### `getNotificationType(message: string): 'info' | 'warning' | 'error' | 'success'`
Determines notification type based on message content.

## API Endpoints

### GET /notifications/{user_id}
**Description**: Get all notifications for a user  
**Response**: `List[NotificationOut]`

**Response Schema:**
```json
[
  {
    "id": 1,
    "user_id": 123,
    "message": "Player John Smith has no overall performance rating.",
    "is_read": false,
    "created_at": "2025-01-14T10:30:00Z"
  }
]
```

### POST /notifications/send
**Description**: Send a new notification  
**Body**: `NotificationCreate`

**Request Schema:**
```json
{
  "user_id": 123,
  "message": "Your notification message here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully."
}
```

### PATCH /notifications/{notification_id}/read
**Description**: Mark a notification as read  
**Response**: `{success: boolean, message: string}`

### DELETE /notifications/{notification_id}
**Description**: Delete a notification  
**Response**: `{success: boolean, message: string}`

### POST /notifications/notify_missing_performance
**Description**: Notify coaches about missing player performance  
**Response**: `{message: string}`

## Usage Examples

### Basic Notification Sending

```typescript
import notificationService from '@/services/notificationService';

// Send a notification
await notificationService.sendNotification({
  user_id: 123,
  message: "Player John Smith has been added to your team."
});
```

### Integration in Components

```typescript
// In a React component
import notificationService from '@/services/notificationService';

const handlePlayerInvite = async () => {
  // ... invite logic ...
  
  // Send notification on success
  await notificationService.sendNotification({
    user_id: coachId,
    message: `Player ${playerName} has been successfully invited to your team.`
  });
};
```

### Using the Dropdown Component

```typescript
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

// In your component
<NotificationDropdown userId={currentUserId} />
```

## Database Schema

The notification system expects the following database table:

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Error Handling

The notification system includes comprehensive error handling:

- **Network Errors**: Graceful handling of API failures
- **Invalid Data**: Validation and user feedback
- **Permission Errors**: Proper error messages for unauthorized actions
- **Database Errors**: Backend error handling with meaningful messages

## Styling

The notification system uses Tailwind CSS for styling:

- **Responsive Design**: Mobile-first approach
- **Hover Effects**: Smooth transitions and interactions
- **Loading States**: Visual feedback during operations
- **Color Coding**: Different colors for notification types

## Performance Considerations

- **Lazy Loading**: Notifications are fetched only when dropdown opens
- **Debounced Updates**: Prevents excessive API calls
- **Memory Management**: Proper cleanup of event listeners
- **Optimistic Updates**: UI updates before API confirmation

## Testing

### Manual Testing

1. Navigate to `/notification-demo` to test the notification system
2. Send sample notifications to yourself
3. Test marking notifications as read
4. Test deleting notifications
5. Test the missing performance notification trigger

### Integration Testing

The notification system integrates with:
- Player invitation system
- Performance management
- Team management
- User authentication (cookies)

## Deployment Considerations

1. **Environment Variables**: Ensure `baseUrl` is configured correctly
2. **API Endpoints**: Verify all notification endpoints are available
3. **Database Migration**: Run notification table creation script
4. **CORS Configuration**: Ensure frontend can access notification endpoints

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live notifications
- **Push Notifications**: Browser push notification support
- **Notification Categories**: Different types of notifications
- **Email Integration**: Email notifications for important updates
- **Notification History**: Archive and search functionality
- **Batch Operations**: Bulk notification management

## Troubleshooting

### Common Issues

1. **Notifications Not Loading**: Check API endpoint and user authentication
2. **Styling Issues**: Verify Tailwind CSS classes are available
3. **TypeScript Errors**: Ensure all types are properly imported
4. **Cookie Issues**: Check user ID cookie is set correctly

### Debug Tips

- Check browser console for API errors
- Verify network requests in browser dev tools
- Test API endpoints directly with tools like Postman
- Check database for notification records

## Support

For issues or questions about the notification system:
1. Check the console for error messages
2. Verify API endpoint availability
3. Test with the notification demo page
4. Review the service layer for proper error handling
