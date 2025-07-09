import React, { useEffect } from 'react';
import { AiOutlineClose, AiOutlineCheckCircle, AiOutlineWarning, AiOutlineCloseCircle } from 'react-icons/ai';

interface AlertProps {
  message: string;
  type?: 'error' | 'success' | 'warning';
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-600',
      text: 'text-red-800',
      icon: <AiOutlineCloseCircle className="text-red-500 text-xl mt-1" />,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-800',
      icon: <AiOutlineCheckCircle className="text-green-500 text-xl mt-1" />,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-800',
      icon: <AiOutlineWarning className="text-yellow-500 text-xl mt-1" />,
    },
  };

  const current = styles[type];

  return (
    <div className="fixed top-6 right-6 z-50 max-w-sm w-full animate-slide-in">
      <div className={`flex items-start gap-3 p-4 border-l-4 rounded-md shadow-md ${current.bg} ${current.border}`}>
        <div>{current.icon}</div>
        <div className={`flex-1 text-sm ${current.text}`}>{message}</div>
        <button onClick={onClose} className="text-gray-400 hover:text-black">
          <AiOutlineClose className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default Alert;
