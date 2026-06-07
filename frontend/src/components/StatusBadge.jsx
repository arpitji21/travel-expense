import { statusClass } from '../lib/formatters';

function StatusBadge({ status }) {
  return (
    <span className={`badge ${statusClass(status)}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export default StatusBadge;
