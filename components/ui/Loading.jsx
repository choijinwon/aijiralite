// components/ui/Loading.jsx
'use client';

export default function Loading({ size = 'md', text, fullScreen = false, className = '' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-2',
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-primary-600 border-t-transparent ${sizes[size]}`}></div>
  );

  if (fullScreen) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="flex flex-col items-center justify-center gap-4">
          {spinner}
          {text && <p className="text-gray-600 text-sm">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {spinner}
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
}

