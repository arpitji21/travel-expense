import { useEffect, useState } from 'react';
import { PageLoading } from '../components/Loader';
import { fetchSchedule, updateScheduleEntry } from '../lib/salesApi';
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

function VisitCard({ entry, onChange, onError }) {
  const [noteDraft, setNoteDraft] = useState(entry.demandNote || '');
  const [savingNote, setSavingNote] = useState(false);

  async function update(payload) {
    try {
      await updateScheduleEntry(entry.id, payload);
      await onChange();
    } catch (err) {
      onError(err.response?.data?.message || 'Unable to update visit.');
    }
  }

  async function saveNote() {
    setSavingNote(true);
    await update({ demandExpected: true, demandNote: noteDraft });
    setSavingNote(false);
  }

  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`font-semibold ${entry.done ? 'text-zinc-400 line-through' : ''}`}>
            {entry.entryTime ? <span className="text-zinc-400">{entry.entryTime} · </span> : null}
            {entry.place}
          </p>
          {entry.note ? <p className="mt-1 text-sm text-zinc-400">From finance: {entry.note}</p> : null}
        </div>
        <label className="flex flex-none items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={entry.done}
            onChange={() => update({ done: !entry.done })}
            className="h-4 w-4 cursor-pointer accent-brand-600"
          />
          Done
        </label>
      </div>

      <div className="mt-3 border-t border-white/10 pt-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={entry.demandExpected}
            onChange={() => update({ demandExpected: !entry.demandExpected })}
            className="h-4 w-4 cursor-pointer accent-brand-600"
          />
          Expected demand at this hospital
        </label>
        {entry.demandExpected ? (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder="What demand do you expect? (e.g. likely needs gloves + syringes)"
              className="input mt-0"
            />
            <button type="button" onClick={saveNote} disabled={savingNote} className="btn-ghost btn-sm flex-none">
              {savingNote ? 'Saving...' : 'Save note'}
            </button>
          </div>
        ) : null}
      </div>
    </li>
  );
}

function SchedulePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadEntries() {
    setLoading(true);
    const data = await fetchSchedule();
    setEntries(data);
    setLoading(false);
  }

  useEffect(() => {
    loadEntries();
  }, []);

  const groups = groupByDate(entries);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Visits</p>
        <h2 className="text-3xl font-extrabold tracking-tight">My assigned visits</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Hospital visits assigned to you by finance. Tick each one off, and flag any hospital where you
          expect demand so finance can act on it.
        </p>
      </div>

      {message ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-200">{message}</p>
      ) : null}

      {loading ? (
        <PageLoading label="Loading visits..." />
      ) : groups.length ? (
        <div className="space-y-5">
          {groups.map((group) => (
            <section key={group.date} className="glass-card p-5">
              <p className="mb-3 text-sm font-semibold text-zinc-300">{formatDate(group.date)}</p>
              <ul className="space-y-3">
                {group.items.map((entry) => (
                  <VisitCard key={entry.id} entry={entry} onChange={loadEntries} onError={setMessage} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <section className="glass-card">
          <p className="px-5 py-10 text-center text-sm text-zinc-400">
            No visits assigned yet. Finance will assign your hospital visits here.
          </p>
        </section>
      )}
    </div>
  );
}

export default SchedulePage;
