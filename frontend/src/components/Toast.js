// @author: fatima bashir
import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 4000 }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          iconColor: '#10b981',
          textColor: '#1f2937',
          borderColor: 'rgba(16, 185, 129, 0.2)',
          shadowColor: 'rgba(16, 185, 129, 0.15)'
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 242, 242, 0.95) 100%)',
          iconColor: '#ef4444',
          textColor: '#1f2937',
          borderColor: 'rgba(239, 68, 68, 0.2)',
          shadowColor: 'rgba(239, 68, 68, 0.15)'
        };
      case 'info':
        return {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(239, 246, 255, 0.95) 100%)',
          iconColor: '#3b82f6',
          textColor: '#1f2937',
          borderColor: 'rgba(59, 130, 246, 0.2)',
          shadowColor: 'rgba(59, 130, 246, 0.15)'
        };
      default:
        return {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          iconColor: '#10b981',
          textColor: '#1f2937',
          borderColor: 'rgba(16, 185, 129, 0.2)',
          shadowColor: 'rgba(16, 185, 129, 0.15)'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
    }
  };

  if (!isVisible && !isAnimating) return null;

  const styles = getToastStyles();

  return (
    <div 
      className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        isAnimating ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95'
      }`}
      style={{
        filter: `drop-shadow(0 25px 50px ${styles.shadowColor})`
      }}
    >
      <div
        className="flex items-center space-x-4 px-8 py-5 rounded-3xl backdrop-blur-xl border min-w-[380px] max-w-md"
        style={{
          background: styles.background,
          color: styles.textColor,
          borderColor: styles.borderColor,
          boxShadow: `0 0 0 1px ${styles.borderColor}, 0 20px 40px -10px ${styles.shadowColor}`
        }}
      >
        {/* Icon */}
        <div 
          className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ 
            backgroundColor: `${styles.iconColor}15`,
            color: styles.iconColor,
            border: `1px solid ${styles.iconColor}25`
          }}
        >
          {getIcon()}
        </div>

        {/* Message */}
        <div className="flex-1">
          <p className="font-medium text-lg leading-tight" style={{ 
            fontFamily: 'Nunito, sans-serif',
            letterSpacing: '-0.01em'
          }}>
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90"
          style={{ 
            backgroundColor: `${styles.iconColor}10`,
            color: `${styles.iconColor}80`,
            border: `1px solid ${styles.iconColor}20`
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = `${styles.iconColor}20`;
            e.target.style.color = styles.iconColor;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = `${styles.iconColor}10`;
            e.target.style.color = `${styles.iconColor}80`;
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 w-full h-1.5 rounded-full overflow-hidden" style={{
        backgroundColor: `${styles.iconColor}15`
      }}>
        <div 
          className="h-full rounded-full animate-progress"
          style={{
            background: `linear-gradient(90deg, ${styles.iconColor}60, ${styles.iconColor})`,
            animationDuration: `${duration}ms`,
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
            boxShadow: `0 0 8px ${styles.iconColor}40`
          }}
        />
      </div>
    </div>
  );
};

export default Toast;