import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  isLoading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-600 active:bg-primary-700',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
  outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100',
  ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
  danger: 'bg-danger text-white shadow-lg shadow-danger/20 hover:bg-red-600 active:bg-red-700',
  success: 'bg-success text-white shadow-lg shadow-success/20 hover:bg-emerald-600 active:bg-emerald-700',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

const iconSizes: Record<string, string> = {
  sm: 'text-[16px]',
  md: 'text-[18px]',
  lg: 'text-[20px]',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center font-bold rounded-lg
        transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <span className={`material-symbols-outlined animate-spin ${iconSizes[size]}`}>progress_activity</span>
      ) : icon ? (
        <span className={`material-symbols-outlined ${iconSizes[size]}`}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
