'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaSpinner, FaServer, FaExclamationTriangle } from 'react-icons/fa';
import { baseUrl } from '@/constants/baseUrl';
import notificationService from '@/services/notificationService';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  details?: any;
  loading?: boolean;
}

const BackendStatusChecker = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Backend Connection', success: false, message: 'Not tested', loading: false },
    { name: 'Notification Endpoints', success: false, message: 'Not tested', loading: false },
    { name: 'FastAPI Docs', success: false, message: 'Not tested', loading: false },
  ]);

  const updateTest = (index: number, update: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...update } : test));
  };

  const testBackendConnection = async () => {
    updateTest(0, { loading: true, message: 'Testing...' });
    
    try {
      const result = await notificationService.testConnection();
      updateTest(0, { 
        loading: false, 
        success: result.success, 
        message: result.message,
        details: result.details 
      });
      return result.success;
    } catch (error) {
      updateTest(0, { 
        loading: false, 
        success: false, 
        message: 'Connection failed',
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  };

  const testNotificationEndpoints = async () => {
    updateTest(1, { loading: true, message: 'Testing...' });
    
    try {
      const result = await notificationService.testNotificationEndpoints();
      updateTest(1, { 
        loading: false, 
        success: result.success, 
        message: result.message,
        details: result.details 
      });
      return result.success;
    } catch (error) {
      updateTest(1, { 
        loading: false, 
        success: false, 
        message: 'Endpoint test failed',
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  };

  const testFastAPIDoc = async () => {
    updateTest(2, { loading: true, message: 'Testing...' });
    
    try {
      const response = await fetch(`${baseUrl}/docs`);
      const success = response.ok;
      updateTest(2, { 
        loading: false, 
        success, 
        message: success ? 'FastAPI docs accessible' : `HTTP ${response.status}`,
        details: { 
          status: response.status,
          statusText: response.statusText,
          url: `${baseUrl}/docs` 
        } 
      });
      return success;
    } catch (error) {
      updateTest(2, { 
        loading: false, 
        success: false, 
        message: 'Cannot access FastAPI docs',
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  };

  const runAllTests = async () => {
    await testBackendConnection();
    await testNotificationEndpoints();
    await testFastAPIDoc();
  };

  useEffect(() => {
    runAllTests();
  }, [runAllTests]); // Add runAllTests dependency

  const getStatusIcon = (test: TestResult) => {
    if (test.loading) return <FaSpinner className="animate-spin text-blue-500" />;
    if (test.success) return <FaCheck className="text-green-500" />;
    return <FaTimes className="text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaServer className="text-2xl text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Backend Status Checker</h1>
          </div>

          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Configuration</h3>
              <p className="text-sm text-gray-600">
                <strong>Base URL:</strong> <code>{baseUrl}</code>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Expected Backend:</strong> FastAPI server with notification endpoints
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Test Results</h2>
              <button
                onClick={runAllTests}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Run All Tests
              </button>
            </div>

            {tests.map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test)}
                    <h3 className="font-semibold text-gray-700">{test.name}</h3>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    test.success ? 'bg-green-100 text-green-800' : 
                    test.loading ? 'bg-blue-100 text-blue-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {test.success ? 'Pass' : test.loading ? 'Testing' : 'Fail'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">{test.message}</p>

                {test.details && (
                  <div className="bg-gray-50 rounded p-3 mt-2">
                    <p className="text-xs text-gray-500 mb-1">Details:</p>
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaExclamationTriangle className="text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Troubleshooting</h3>
            </div>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• Make sure your FastAPI backend is running on {baseUrl}</p>
              <p>• Check that notification routes are registered in your FastAPI app</p>
              <p>• Verify CORS settings allow requests from localhost:3000</p>
              <p>• Check the backend console for any error messages</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Next Steps</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>1. Start your FastAPI backend server</p>
              <p>2. Add the notification router to your FastAPI app</p>
              <p>3. Test the endpoints manually at {baseUrl}/docs</p>
              <p>4. Check browser console for CORS errors</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BackendStatusChecker;
