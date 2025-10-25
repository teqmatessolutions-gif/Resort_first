import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const BannerMessage = ({ message, onClose, autoDismiss = true, duration = 5000 }) => {
  useEffect(() => {
    if (autoDismiss && message.text) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message.text, autoDismiss, duration, onClose]);

  if (!message.text) return null;

  const isSuccess = message.type === 'success';
  const bgColor = isSuccess ? 'bg-green-600' : 'bg-red-600';
  const icon = isSuccess ? '✅' : '❌';

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${bgColor} text-white shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2 text-lg">{icon}</span>
            <span className="font-medium">{message.text}</span>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerMessage;
