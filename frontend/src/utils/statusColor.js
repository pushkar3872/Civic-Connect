const statusColors = {
  NEW: 'badge-info',
  UNDER_REVIEW: 'badge-warning',
  ASSIGNED: 'badge-secondary',
  IN_PROGRESS: 'badge-primary',
  COMPLETED_BY_WORKER: 'badge-accent',
  REWORK_REQUIRED: 'badge-error',
  VERIFIED_BY_ADMIN: 'badge-success',
  CLOSED: 'badge-neutral',
};

export const statusColor = (status) => statusColors[status] || 'badge-ghost';

export const statusLabel = (status) =>
  status?.replace(/_/g, ' ') || 'Unknown';
