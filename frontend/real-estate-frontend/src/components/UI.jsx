import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false,
  ...props 
}) => {
  const variants = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    gold: 'btn-gold',
    ghost: 'hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-lg transition-all',
  };

  return (
    <button 
      className={`${variants[variant]} ${className} flex items-center justify-center gap-2 relative overflow-hidden`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="text-sm font-semibold text-slate-700 tracking-tight">{label}</label>}
      <input 
        className={`
          w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all
          placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
        `}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

export const Card = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`card-premium p-6 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
