"use client";

import { DataPreloadProvider } from '@/contexts/DataPreloadContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <DataPreloadProvider>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </DataPreloadProvider>
  );
}
