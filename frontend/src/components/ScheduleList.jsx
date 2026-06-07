import { formatDate } from '../lib/formatters';

function groupByDate(entries) {
  const groups = [];
  const index = {};

  entries.forEach((entry) => {
    if (!(entry.entryDate in index)) {
      index[entry.entryDate] = groups.length;
      groups.push({ date: entry.entryDate, items: [] });
    }
    groups[index[entry.entryDate]].items.push(entry);
  });

  return groups;
}

function ScheduleList({ entries, onToggleDone, onDelete, emptyText = 'No schedule entries yet.' }) {
  if (!entries.length) {
    return <p className="px-1 py-6 text-sm text-zinc-600">{emptyText}</p>;
  }

  return (
    <div className="space-y-5">
      {groupByDate(entries).map((group) => (
        <div key={group.date}>
          <p className="mb-2 text-sm font-semibold text-zinc-500">{formatDate(group.date)}</p>
          <ul className="space-y-2">
            {group.items.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200/70 bg-white/70 p-3 transition hover:border-brand-200"
              >
                <div className="flex items-start gap-3">
                  {onToggleDone ? (
                    <input
                      type="checkbox"
                      checked={entry.done}
                      onChange={() => onToggleDone(entry)}
                      className="mt-1 h-4 w-4 cursor-pointer accent-brand-600"
                      title="Mark visited"
                    />
                  ) : (
                    <span
                      className={`mt-1 inline-block h-3 w-3 flex-none rounded-full ${
                        entry.done ? 'bg-emerald-500' : 'bg-zinc-300'
                      }`}
                      title={entry.done ? 'Visited' : 'Planned'}
                    />
                  )}
                  <div>
                    <p className={`font-semibold ${entry.done ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>
                      {entry.entryTime ? <span className="text-zinc-500">{entry.entryTime} · </span> : null}
                      {entry.place}
                    </p>
                    {entry.note ? <p className="text-sm text-zinc-600">{entry.note}</p> : null}
                  </div>
                </div>

                {onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(entry.id)}
                    className="text-sm font-semibold text-rose-600 hover:text-rose-800"
                  >
                    Delete
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default ScheduleList;
