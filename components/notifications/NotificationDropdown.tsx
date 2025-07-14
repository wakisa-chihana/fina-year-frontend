'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTimes, FaCheck, FaTrash, FaExclamationCircle } from 'react-icons/fa';
import { baseUrl } from '@/constants/baseUrl';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import notificationService, { Notification as NotificationData } from '@/services/notificationService';

interface Notification {
  id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationDropdownProps {
  userId?: number;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ userId: propUserId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(propUserId || null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user ID from cookie if not provided
  useEffect(() => {
    if (!propUserId) {
      const cookieUserId = Cookies.get('x-user-id');
      if (cookieUserId) {
        setUserId(Number(cookieUserId));
      }
    }
  }, [propUserId]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getUserNotifications(userId);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        const errorMsg = 'Cannot connect to notification service. Please check if the backend is running on http://127.0.0.1:8000';
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        const errorMsg = 'Failed to load notifications. Please try again later.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Error marking notification as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Error deleting notification');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return notificationService.formatNotificationDate(dateString);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when component mounts or user changes
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]); // Add fetchNotifications dependency

  // Toggle dropdown and fetch notifications
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && userId) {
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <motion.button
        onClick={toggleDropdown}
        className={`relative p-3 rounded-full transition-all duration-200 group ${
          isOpen 
            ? 'bg-[#28809A] text-white shadow-lg' 
            : 'hover:bg-gray-100 hover:shadow-md'
        }`}
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.div
          className="relative"
          animate={
            loading ? {
              rotate: 360,
              transition: {
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }
            } : unreadCount > 0 && !isOpen ? { 
              rotate: [0, -10, 10, -10, 0],
              transition: { 
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 3
              }
            } : {}
          }
        >
          <FaBell className={`text-xl transition-all duration-200 ${
            isOpen 
              ? 'text-white'
              : unreadCount > 0 
                ? 'text-[#28809A] drop-shadow-md' 
                : 'text-gray-600 group-hover:text-[#28809A]'
          }`} />
          
          {/* Pulse effect for unread notifications */}
          {unreadCount > 0 && !isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full bg-[#28809A] opacity-20"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.1, 0.2]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
        
        {/* Enhanced unread count badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-bold shadow-lg border-2 border-white"
            whileHover={{ scale: 1.1 }}
          >
            <motion.span
              key={unreadCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          </motion.div>
        )}
        
        {/* Active indicator ring */}
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute inset-0 rounded-full border-2 border-white/30"
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          />
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden backdrop-blur-sm"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">
                  <FaExclamationCircle className="mx-auto text-3xl mb-2" />
                  <p className="text-sm font-medium mb-2">Connection Error</p>
                  <p className="text-xs text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={() => fetchNotifications()}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <FaBell className="mx-auto text-3xl mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FaExclamationCircle className="text-blue-500 text-sm flex-shrink-0" />
                            <p className="text-sm text-gray-600 font-medium">
                              {formatDate(notification.created_at)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                              title="Mark as read"
                            >
                              <FaCheck className="text-xs" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            title="Delete notification"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    // Mark all as read using service
                    if (userId) {
                      notificationService.markAllAsRead(userId);
                      setNotifications(prev => 
                        prev.map(notif => ({ ...notif, is_read: true }))
                      );
                    }
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
