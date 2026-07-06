/**
 * Determine the status of a key for visual indicators.
 * Returns: 'active', 'expired', 'expiring-soon', or 'inactive'
 */
export function getKeyStatus(key) {
  if (!key.isActive) return 'inactive';
  if (key.expirationDate) {
    const now = new Date();
    const exp = new Date(key.expirationDate);
    if (exp < now) return 'expired';
    const daysUntilExp = (exp - now) / (1000 * 60 * 60 * 24);
    if (daysUntilExp <= 30) return 'expiring-soon';
  }
  return 'active';
}

export function statusBadge(status) {
  const map = {
    active: {
      label: 'Active',
      class: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800',
    },
    expired: {
      label: 'Expired',
      class: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800',
    },
    'expiring-soon': {
      label: 'Expiring Soon',
      class: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800',
    },
    inactive: {
      label: 'Inactive',
      class: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/40 dark:text-gray-400 dark:border-gray-600',
    },
  };
  return map[status] || map.active;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}