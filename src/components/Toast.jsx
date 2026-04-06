import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onDismiss, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300); // Wait for fade exit
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div className={`toast-notification ${visible ? 'visible' : 'exit'} ${type}`}>
      <AlertCircle size={16} />
      <span className="toast-message">{message}</span>
      <button className="toast-dismiss" onClick={() => setVisible(false)}>
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
