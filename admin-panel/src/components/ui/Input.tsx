import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  helperText?: string;
}

export default function Input({ label, error, icon, helperText, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-800
            placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            transition-all
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-danger focus:ring-danger/20 focus:border-danger' : 'border-slate-200'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
}
