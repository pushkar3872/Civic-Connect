const priorityColors = {
  LOW: 'badge-ghost',
  MEDIUM: 'badge-info',
  HIGH: 'badge-warning',
  CRITICAL: 'badge-error',
};

export const priorityColor = (priority) => priorityColors[priority] || 'badge-ghost';
