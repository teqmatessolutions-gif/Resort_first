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
    <div className={`fixed top-0 right-0 z-50 ${bgColor} text-white shadow-lg rounded-bl-lg max-w-md`}>
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2 text-sm">{icon}</span>
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button
            onClick={onClose}
            className="ml-2 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerMessage;
