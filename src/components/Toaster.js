import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Toaster.css';

function Toaster({ notification, onClear }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification && notification.message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Allow fade-out animation to complete before clearing
        setTimeout(onClear, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClear]);

  if (!notification || !notification.message) {
    return null;
  }

  const typeClass = notification.type === 'error' ? 'error' : 'success';
  const visibleClass = isVisible ? 'visible' : '';

  return ReactDOM.createPortal(
    <div className={`toaster ${typeClass} ${visibleClass}`}>
      {notification.message}
    </div>,
    document.getElementById('toaster-root')
  );
}

export default Toaster;