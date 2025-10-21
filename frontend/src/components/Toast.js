import React, { useEffect } from 'react';

const Toast = ({ type = 'info', message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <span>{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Close">×</button>
    </div>
  );
};

export default Toast;


