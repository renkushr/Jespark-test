import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  footer?: ReactNode;
  noPadding?: boolean;
  className?: string;
}

export default function Card({ children, title, action, footer, noPadding = false, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
          {title && <h3 className="font-bold text-slate-800">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4 sm:p-6'}>
        {children}
      </div>
      {footer && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
}
