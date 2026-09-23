import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-0 animate-fadeUp ${
              item.type === 'success'
                ? 'bg-white border-emerald-200 text-emerald-900'
                : item.type === 'error'
                ? 'bg-white border-rose-200 text-rose-900'
                : 'bg-white border-brand-teal/20 text-brand-dark'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.type === 'success' && (
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  ✓
                </span>
              )}
              {item.type === 'error' && (
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
                  ✕
                </span>
              )}
              {item.type === 'info' && (
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-tealLight text-brand-teal flex items-center justify-center font-bold text-sm">
                  ℹ
                </span>
              )}
              <p className="text-sm font-medium pr-2">{item.message}</p>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="text-gray-400 hover:text-gray-600 text-xs px-1.5 py-0.5 rounded transition-colors"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
