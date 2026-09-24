import { type ReactNode } from 'react';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'triage-red'
  | 'triage-orange'
  | 'triage-yellow'
  | 'triage-light-green'
  | 'triage-green';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-navy-50 text-navy-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-600',
  'triage-red': 'bg-triage-red-light text-triage-red',
  'triage-orange': 'bg-triage-orange-light text-triage-orange',
  'triage-yellow': 'bg-triage-yellow-light text-triage-yellow',
  'triage-light-green': 'bg-triage-light-green-light text-triage-light-green',
  'triage-green': 'bg-triage-green-light text-triage-green',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, BadgeVariant> = {
    active: 'success',
    available: 'success',
    approved: 'success',
    completed: 'success',
    arrived: 'success',
    suspended: 'danger',
    rejected: 'danger',
    cancelled: 'danger',
    unavailable: 'danger',
    pending: 'warning',
    maintenance: 'warning',
    awaiting_confirmation: 'warning',
    matching: 'warning',
    assessment_in_progress: 'warning',
    dispatched: 'info',
    in_transit: 'info',
    on_mission: 'info',
    hospital_confirmed: 'info',
    ambulance_assigned: 'info',
    new: 'default',
  };
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return <Badge variant={statusMap[status] || 'neutral'}>{label}</Badge>;
}
