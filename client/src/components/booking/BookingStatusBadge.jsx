import React from 'react';

/**
 * Reusable Booking Status Badge Component
 * Renders clear visual indicators for booking statuses:
 * 🟡 Pending
 * 🟢 Confirmed / Accepted
 * 🔴 Rejected / Cancelled
 * 🔵 Completed
 * 🟣 In Progress
 * 
 * Supports both small (chip) and large (card banner) sizes.
 */
export default function BookingStatusBadge({ status, size = 'md', className = '' }) {
  const normalizedStatus = (status || 'pending').toLowerCase().trim();

  const getStatusConfig = (s) => {
    switch (s) {
      case 'confirmed':
      case 'accepted':
      case 'approved':
        return {
          emoji: '🟢',
          label: 'Confirmed',
          subLabel: 'Your royal ride is reserved',
          bgClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300',
          dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
          textClass: 'text-emerald-800'
        };
      case 'completed':
      case 'finished':
        return {
          emoji: '🔵',
          label: 'Completed',
          subLabel: 'Celebration ride completed successfully',
          bgClass: 'bg-blue-500/15 border-blue-500/30 text-blue-800 dark:text-blue-300',
          dotClass: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]',
          textClass: 'text-blue-800'
        };
      case 'in_progress':
      case 'on_trip':
      case 'started':
        return {
          emoji: '🟣',
          label: 'In Progress',
          subLabel: 'Your Baraat ride is currently active',
          bgClass: 'bg-purple-500/15 border-purple-500/30 text-purple-800 dark:text-purple-300',
          dotClass: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse',
          textClass: 'text-purple-800'
        };
      case 'rejected':
      case 'declined':
        return {
          emoji: '🔴',
          label: 'Rejected',
          subLabel: 'Ride request was not accepted',
          bgClass: 'bg-rose-500/15 border-rose-500/30 text-rose-800 dark:text-rose-300',
          dotClass: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
          textClass: 'text-rose-800'
        };
      case 'cancelled':
        return {
          emoji: '🔴',
          label: 'Cancelled',
          subLabel: 'This booking has been cancelled',
          bgClass: 'bg-red-500/15 border-red-500/30 text-red-800 dark:text-red-300',
          dotClass: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
          textClass: 'text-red-800'
        };
      case 'pending':
      case 'awaiting':
      default:
        return {
          emoji: '🟡',
          label: 'Pending',
          subLabel: 'Awaiting vendor confirmation',
          bgClass: 'bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300',
          dotClass: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse',
          textClass: 'text-amber-800'
        };
    }
  };

  const config = getStatusConfig(normalizedStatus);

  if (size === 'lg') {
    return (
      <div
        className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-md shadow-sm transition-all ${config.bgClass} ${className}`}
      >
        <div className="relative flex items-center justify-center">
          <span className="text-xl" role="img" aria-label={config.label}>
            {config.emoji}
          </span>
          <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${config.dotClass}`} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-black uppercase tracking-widest leading-none">
            {config.label}
          </span>
          <span className="text-[11px] font-semibold opacity-80 mt-0.5">
            {config.subLabel}
          </span>
        </div>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-xs ${config.bgClass} ${className}`}
      >
        <span className="text-xs" role="img" aria-label={config.label}>
          {config.emoji}
        </span>
        <span>{config.label}</span>
      </span>
    );
  }

  // default 'md'
  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold tracking-wide shadow-xs ${config.bgClass} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClass}`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotClass}`} />
      </span>
      <span className="text-sm" role="img" aria-label={config.label}>
        {config.emoji}
      </span>
      <span className="font-black uppercase text-[11px] tracking-widest">
        {config.label}
      </span>
    </span>
  );
}
