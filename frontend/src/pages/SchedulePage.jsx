import { useEffect, useState } from 'react';
import { PageLoading } from '../components/Loader';
import ScheduleList from '../components/ScheduleList';
import {
  createScheduleEntry,
  deleteScheduleEntry,
  fetchSchedule,
  updateScheduleEntry
} from '../lib/salesApi';

const todayIso = () => new Date().toISOString().slice(0, 10);

function SchedulePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [entryDate, setEntryDate] = useState(todayIso());
  const [entryTime, setEntryTime] = useState('');
  const [place, setPlace] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadEntries() {
    setLoading(true);
    const data = await fetchSchedule();
    setEntries(data);
    setLoading(false);
  }

  useEffect(() => {
    loadEntries();
  }, []);

  async function handleAdd(event) {
    event.preventDefault();
    setMessage('');
    setSaving(true);

    try {
      await createScheduleEntry({ entryDate, entryTime, place, note });
      setPlace('');
      setNote('');
      setEntryTime('');
      await loadEntries();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to add entry.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(entry) {
    try {
      await updateScheduleEntry(entry.id, { done: !entry.done });
      await loadEntries();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to update entry.');
    }
  }

  async function handleDelete(entryId) {
    try {
      await deleteScheduleEntry(entryId);
      await loadEntries();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to delete entry.');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Schedule</p>
        <h2 className="text-3xl font-extrabold tracking-tight">My daily schedule</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Plan your visits and tick each one off as you complete it — your manager can see this too.
        </p>
      </div>

      <form onSubmit={handleAdd} className="glass-card grid gap-3 p-4 sm:grid-cols-[auto_auto_1fr_auto]">
        <input
          type="date"
          value={entryDate}
          onChange={(event) => setEntryDate(event.target.value)}
          required
          className="input mt-0"
        />
        <input
          type="time"
          value={entryTime}
          onChange={(event) => setEntryTime(event.target.value)}
          className="input mt-0"
        />
        <input
          value={place}
          onChange={(event) => setPlace(event.target.value)}
          required
          placeholder="Place / hospital to visit"
          className="input mt-0"
        />
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Adding...' : 'Add'}
        </button>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Note (optional)"
          className="input mt-0 sm:col-span-4"
        />
      </form>

      {message ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-200">{message}</p>
      ) : null}

      {loading ? (
        <PageLoading label="Loading schedule..." />
      ) : (
        <div className="glass-card p-5">
          <ScheduleList
            entries={entries}
            onToggleDone={handleToggle}
            onDelete={handleDelete}
            emptyText="No schedule entries yet. Add your first visit above."
          />
        </div>
      )}
    </div>
  );
}

export default SchedulePage;
