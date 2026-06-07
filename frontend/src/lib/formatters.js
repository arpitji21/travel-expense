export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency
  }).format(Number(amount || 0));
}

export function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
}

export function statusClass(status) {
  const classes = {
    // Expense statuses
    submitted: 'bg-teal-50 text-teal-700 border-teal-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    reimbursed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    // Demand statuses
    open: 'bg-amber-50 text-amber-700 border-amber-200',
    fulfilled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-zinc-100 text-zinc-700 border-zinc-200'
  };

  return classes[status] || classes.submitted;
}
