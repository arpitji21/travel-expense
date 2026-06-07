import { statusClass } from '../lib/formatters';

function StatusBadge({ status }) {
  return (
    <span className={`rounded-md border px-2 py-1 text-xs font-semibold uppercase ${statusClass(status)}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
