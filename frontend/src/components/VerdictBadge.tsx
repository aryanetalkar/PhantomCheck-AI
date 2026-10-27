import React from 'react';
import { VerdictStatus } from '../types';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface VerdictBadgeProps {
  verdict: VerdictStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ verdict, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1 font-semibold',
    md: 'text-sm px-3.5 py-1 gap-1.5 font-bold',
    lg: 'text-base px-5 py-2 gap-2 font-extrabold tracking-wide',
  };

  if (verdict === 'SUPPORTED') {
    return (
      <span
        className={`inline-flex items-center rounded-md bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 shadow-sm ${sizeClasses[size]}`}
      >
        <CheckCircle2 className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        SUPPORTED
      </span>
    );
  }

  if (verdict === 'CONTRADICTED') {
    return (
      <span
        className={`inline-flex items-center rounded-md bg-rose-950/70 border border-rose-500/40 text-rose-300 shadow-sm ${sizeClasses[size]}`}
      >
        <XCircle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        CONTRADICTED
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-md bg-amber-950/70 border border-amber-500/40 text-amber-300 shadow-sm ${sizeClasses[size]}`}
    >
      <HelpCircle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      UNVERIFIED
    </span>
  );
};
