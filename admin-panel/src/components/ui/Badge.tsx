interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';
  hasDot?: boolean;
  className?: string;
}

const variantStyles: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  neutral: 'bg-slate-50 text-slate-600 border-slate-200',
};

const dotStyles: Record<string, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
  primary: 'bg-primary',
  neutral: 'bg-slate-400',
};

export default function Badge({ children, variant = 'neutral', hasDot = false, className = '' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border
      ${variantStyles[variant]} ${className}
    `}>
      {hasDot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />}
      {children}
    </span>
  );
}
