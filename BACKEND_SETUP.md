# Backend Setup Instructions for Notification System

## 1. Add the notification router to your FastAPI app

In your main FastAPI app file (likely `main.py` or `app.py`), add:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from your_notification_router import router as notification_router  # Adjust import path

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the notification router
app.include_router(notification_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

## 2. Database Setup

Make sure you have a `notifications` table in your database:

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

## 3. Test the backend

1. Start your FastAPI server:
   ```bash
   python main.py
   ```

2. Open http://127.0.0.1:8000/docs in your browser

3. Test the notification endpoints:
   - GET /notifications/{user_id}
   - POST /notifications/send
   - PATCH /notifications/{notification_id}/read
   - DELETE /notifications/{notification_id}

## 4. Frontend Testing

1. Visit http://localhost:3000/backend-status to check connectivity
2. Visit http://localhost:3000/notification-demo to test the notification system

## 5. Common Issues

### "Failed to fetch" Error
- Backend is not running on port 8000
- CORS is not configured correctly
- Network connectivity issues

### "404 Not Found" Error
- Notification router is not included in the FastAPI app
- Incorrect endpoint URLs

### "500 Internal Server Error"
- Database connection issues
- Missing database tables
- Backend code errors

## 6. Debugging Steps

1. Check if backend is running:
   ```bash
   curl http://127.0.0.1:8000/docs
   ```

2. Test a simple endpoint:
   ```bash
   curl http://127.0.0.1:8000/notifications/1
   ```

3. Check backend logs for errors

4. Verify database connection and table structure

5. Test CORS by opening browser dev tools and checking for CORS errors
