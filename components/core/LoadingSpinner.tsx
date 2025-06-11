
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class e.g. 'text-accent'
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-accent', text }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${color} border-t-transparent`}
        style={{ borderTopColor: 'transparent' }}
      ></div>
      {text && <p className={`text-sm ${color}`}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
    