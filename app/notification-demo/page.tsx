'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBell, FaUser, FaPaperPlane, FaCheck, FaTrash, FaWifi, FaServer } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import notificationService from '@/services/notificationService';
import backendTest from '@/utils/backendTest';

const NotificationDemo = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  
  const currentUserId = Number(Cookies.get('x-user-id')) || 1;

  const handleSendNotification = async () => {
    if (!message.trim() || !targetUserId.trim()) {
      toast.error('Please fill in both message and target user ID');
      return;
    }

    setLoading(true);
    try {
      await notificationService.sendNotification({
        user_id: Number(targetUserId),
        message: message.trim(),
      });
      
      toast.success('Notification sent successfully!');
      setMessage('');
      setTargetUserId('');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerMissingPerformance = async () => {
    setLoading(true);
    try {
      const result = await notificationService.notifyMissingPerformance();
      toast.success(result.message || 'Performance notifications triggered successfully!');
    } catch (error) {
      console.error('Error triggering performance notifications:', error);
      toast.error('Failed to trigger performance notifications');
    } finally {
      setLoading(false);
    }
  };

  const sampleNotifications = [
    {
      user_id: currentUserId,
      message: "Welcome to Sports Analytics! Your dashboard is ready.",
    },
    {
      user_id: currentUserId,
      message: "Player 'John Smith' has no overall performance rating. Please update their performance profile.",
    },
    {
      user_id: currentUserId,
      message: "Your team formation for the upcoming match has been updated.",
    },
  ];

  const handleTestBackend = async () => {
    setLoading(true);
    try {
      const results = await backendTest.runAllTests();
      setTestResults(results);
      
      if (results.connection.success && results.notifications.success) {
        toast.success('Backend tests passed! All systems are working.');
      } else {
        toast.error('Backend tests failed. Check console for details.');
      }
    } catch (error) {
      console.error('Error running backend tests:', error);
      toast.error('Failed to run backend tests');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSampleNotifications = async () => {
    setLoading(true);
    try {
      for (const notification of sampleNotifications) {
        await notificationService.sendNotification(notification);
      }
      toast.success('Sample notifications sent successfully!');
    } catch (error) {
      console.error('Error sending sample notifications:', error);
      toast.error('Failed to send sample notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaBell className="text-2xl text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Notification System Demo</h1>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Send Custom Notification */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaPaperPlane className="text-blue-600" />
                Send Custom Notification
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Target User ID
                  </label>
                  <input
                    type="number"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    placeholder="Enter user ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your notification message..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  onClick={handleSendNotification}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaUser className="text-green-600" />
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleTestBackend}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {loading ? 'Testing...' : 'Test Backend Connection'}
                </button>
                
                <button
                  onClick={handleSendSampleNotifications}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Send Sample Notifications to Me
                </button>
                
                <button
                  onClick={handleTriggerMissingPerformance}
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Trigger Missing Performance Notifications
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Test Results */}
        {testResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaServer className="text-blue-600" />
              Backend Test Results
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${testResults.connection.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FaWifi className={testResults.connection.success ? 'text-green-600' : 'text-red-600'} />
                  Connection Test
                </h3>
                <p className={`text-sm ${testResults.connection.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResults.connection.message}
                </p>
                {testResults.connection.details && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(testResults.connection.details, null, 2)}
                  </pre>
                )}
              </div>
              
              <div className={`p-4 rounded-lg ${testResults.notifications.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FaBell className={testResults.notifications.success ? 'text-green-600' : 'text-red-600'} />
                  Notifications Test
                </h3>
                <p className={`text-sm ${testResults.notifications.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResults.notifications.message}
                </p>
                {testResults.notifications.details && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(testResults.notifications.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* API Endpoints Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Available API Endpoints</h2>
          
          <div className="grid gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">GET /notifications/&#123;user_id&#125;</h3>
              <p className="text-sm text-gray-600 mb-2">Get all notifications for a user</p>
              <div className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                Response: List[NotificationOut]
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">POST /notifications/send</h3>
              <p className="text-sm text-gray-600 mb-2">Send a new notification</p>
              <div className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                Body: {JSON.stringify({ user_id: "int", message: "string" }, null, 2)}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">PATCH /notifications/&#123;notification_id&#125;/read</h3>
              <p className="text-sm text-gray-600 mb-2">Mark notification as read</p>
              <div className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                Response: {JSON.stringify({ success: true, message: "string" }, null, 2)}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">DELETE /notifications/&#123;notification_id&#125;</h3>
              <p className="text-sm text-gray-600 mb-2">Delete a notification</p>
              <div className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                Response: {JSON.stringify({ success: true, message: "string" }, null, 2)}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">POST /notifications/notify_missing_performance</h3>
              <p className="text-sm text-gray-600 mb-2">Notify coaches about missing player performance</p>
              <div className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                Response: {JSON.stringify({ message: "string" }, null, 2)}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationDemo;
