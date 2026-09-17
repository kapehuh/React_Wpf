// src/components/Toast.jsx
import React, { useEffect } from 'react';

const Toast = ({ message, onClose, duration = 3000, type = 'error' }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  const bg = type === 'error'   ? 'bg-red-600'
           : type === 'warning' ? 'bg-yellow-600'
           : type === 'info'    ? 'bg-blue-600'
           : 'bg-red-600';

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 ${bg} text-white px-4 py-2 rounded shadow-lg`}>
      {message}
    </div>
  );
};

export default Toast;