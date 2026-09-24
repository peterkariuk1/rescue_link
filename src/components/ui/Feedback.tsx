import { type ReactNode } from 'react';
import { Loader2, Inbox, AlertCircle } from 'lucide-react';

export function LoadingSpinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-accent ${className}`} />;
}

export function LoadingCard({ lines = 4 }: { lines?: number }) {
  return (
    <div className="card p-5 space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-4" style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-navy-50 flex items-center justify-center mb-4">
        <Inbox size={28} className="text-navy-300" />
      </div>
      <h3 className="text-base font-semibold text-navy-950 mb-1">{title}</h3>
      <p className="text-sm text-navy-400 max-w-sm mb-4">{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-navy-950 mb-1">Something went wrong</h3>
      <p className="text-sm text-navy-400 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button className="btn-secondary" onClick={onRetry}>Try again</button>
      )}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function KPICard({
  label,
  value,
  icon,
  trend,
  color = 'navy',
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: 'navy' | 'accent' | 'success' | 'warning' | 'danger';
}) {
  const colorMap = {
    navy: 'bg-navy-50 text-navy-600',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-red-50 text-red-600',
  };
  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-navy-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-navy-950 mt-1">{value}</p>
          {trend && <p className="text-xs text-navy-400 mt-1">{trend}</p>}
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
