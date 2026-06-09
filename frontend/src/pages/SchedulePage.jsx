import { useEffect, useState } from 'react';
import { PageLoading, Spinner } from '../components/Loader';
import { createScheduleEntry, deleteScheduleEntry, fetchSchedule, updateScheduleEntry } from '../lib/salesApi';
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
  groups.sort((a, b) => b.date.localeCompare(a.date));
  return groups;
}

function VisitCard({ entry, onChange, onError }) {
  const [noteDraft, setNoteDraft] = useState(entry.demandNote || '');
  const [savingNote, setSavingNote] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    if (!window.confirm('Delete this visit?')) return;
    setDeleting(true);
    try {
      await deleteScheduleEntry(entry.id);
      await onChange();
    } catch (err) {
      onError(err.response?.data?.message || 'Unable to delete visit.');
      setDeleting(false);
    }
  }

  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className={`font-semibold ${entry.done ? 'text-zinc-400 line-through' : ''}`}>
            {entry.entryTime ? <span className="text-zinc-400">{entry.entryTime} · </span> : null}
            {entry.place}
          </p>
          {entry.note ? <p className="mt-1 text-sm text-zinc-400">From finance: {entry.note}</p> : null}
        </div>
        <div className="flex flex-none items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={entry.done}
              onChange={() => update({ done: !entry.done })}
              className="h-4 w-4 cursor-pointer accent-brand-600"
            />
            Done
          </label>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-zinc-500 hover:text-rose-400 transition-colors"
            title="Delete visit"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
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

function AddVisitForm({ onAdded, onCancel }) {
  const [place, setPlace] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [entryTime, setEntryTime] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createScheduleEntry({ place, entryDate, entryTime: entryTime || null, note });
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add visit.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card mb-6 animate-fade-in space-y-4 p-5">
      <h3 className="font-bold text-lg">Add new visit</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="field-label">Hospital / Place</span>
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            required
            className="input"
            placeholder="e.g. City General Hospital"
          />
        </label>
        <label className="block">
          <span className="field-label">Date</span>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            required
            className="input"
          />
        </label>
        <label className="block">
          <span className="field-label">Time (optional)</span>
          <input
            type="time"
            value={entryTime}
            onChange={(e) => setEntryTime(e.target.value)}
            className="input"
          />
        </label>
      </div>
      <label className="block">
        <span className="field-label">Note (optional)</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input"
          placeholder="e.g. Follow up on last week's delivery"
        />
      </label>
      {error && <p className="text-sm font-medium text-rose-400">{error}</p>}
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? <Spinner tone="white" className="h-4 w-4" /> : 'Add visit'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}

function SchedulePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  async function loadEntries() {
    setLoading(showAddForm ? false : true);
    try {
      const data = await fetchSchedule();
      setEntries(data);
    } catch (err) {
      setMessage('Failed to load visits.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  const groups = groupByDate(entries);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Visits</p>
          <h2 className="text-3xl font-extrabold tracking-tight">My visits</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Plan your day. Add your own hospital visits or complete those assigned by finance.
          </p>
        </div>
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="btn-primary flex-none">
            Add visit
          </button>
        )}
      </div>

      {message ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-200">{message}</p>
      ) : null}

      {showAddForm && (
        <AddVisitForm
          onAdded={() => {
            setShowAddForm(false);
            loadEntries();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

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
            No visits scheduled yet. Click “Add visit” to plan your day.
          </p>
        </section>
      )}
    </div>
  );
}

export default SchedulePage;
