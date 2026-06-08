import { useEffect, useState } from 'react';
import { PageLoading } from '../components/Loader';
import SalespersonFilter from '../components/SalespersonFilter';
import {
  createScheduleEntry,
  deleteScheduleEntry,
  fetchSalespeople,
  fetchSchedule
} from '../lib/salesApi';
import { formatDate } from '../lib/formatters';

const todayIso = () => new Date().toISOString().slice(0, 10);
const EMPTY_FORM = { userId: '', place: '', entryDate: todayIso(), entryTime: '', note: '' };

function FinanceSchedulePage() {
  const [salespeople, setSalespeople] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSalespeople().then(setSalespeople).catch(() => setSalespeople([]));
  }, []);

  async function loadEntries(userId, date) {
    setLoading(true);
    const params = {};
    if (userId) params.userId = userId;
    if (date) params.date = date;
    const data = await fetchSchedule(params);
    setEntries(data);
    setLoading(false);
  }

  useEffect(() => {
    loadEntries(selectedUserId, dateFilter);
  }, [selectedUserId, dateFilter]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAssign(event) {
    event.preventDefault();
    setMessage('');

    if (!form.userId) {
      setMessage('Choose a salesperson to assign the visit to.');
      return;
    }

    setSaving(true);
    try {
      await createScheduleEntry({
        userId: Number(form.userId),
        place: form.place.trim(),
        entryDate: form.entryDate,
        entryTime: form.entryTime || undefined,
        note: form.note.trim() || undefined
      });
      await loadEntries(selectedUserId, dateFilter);
      setForm({ ...EMPTY_FORM, userId: form.userId, entryDate: form.entryDate });
      setShowForm(false);
      setMessage('Visit assigned.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to assign visit.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(entryId) {
    setMessage('');
    try {
      await deleteScheduleEntry(entryId);
      await loadEntries(selectedUserId, dateFilter);
      setMessage('Visit removed.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to remove visit.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Visits</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Assign hospital visits</h2>
          <p className="mt-1 text-sm text-zinc-400">Assign daily hospital visits to your salespeople.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <SalespersonFilter salespeople={salespeople} value={selectedUserId} onChange={setSelectedUserId} />
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            Date
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="input mt-0"
            />
          </label>
          <button type="button" onClick={() => setShowForm((value) => !value)} className="btn-primary">
            {showForm ? 'Close' : 'Assign visit'}
          </button>
        </div>
      </div>

      {message ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-200">{message}</p>
      ) : null}

      {showForm ? (
        <form onSubmit={handleAssign} className="glass-card space-y-4 p-6">
          <p className="section-title">Assign a visit</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="field-label">Salesperson</span>
              <select
                value={form.userId}
                onChange={(event) => setField('userId', event.target.value)}
                required
                className="input"
              >
                <option value="">Select salesperson</option>
                {salespeople.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.email}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="field-label">Hospital</span>
              <input
                value={form.place}
                onChange={(event) => setField('place', event.target.value)}
                required
                className="input"
                placeholder="e.g. City General Hospital"
              />
            </label>
            <label className="block">
              <span className="field-label">Date</span>
              <input
                type="date"
                value={form.entryDate}
                onChange={(event) => setField('entryDate', event.target.value)}
                required
                className="input"
              />
            </label>
            <label className="block">
              <span className="field-label">Time (optional)</span>
              <input
                type="time"
                value={form.entryTime}
                onChange={(event) => setField('entryTime', event.target.value)}
                className="input"
              />
            </label>
          </div>
          <label className="block">
            <span className="field-label">Note (optional)</span>
            <input
              value={form.note}
              onChange={(event) => setField('note', event.target.value)}
              className="input"
              placeholder="Instructions for the salesperson"
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Assigning...' : 'Assign visit'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <PageLoading label="Loading visits..." />
      ) : (
        <section className="glass-card overflow-hidden">
          {entries.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-zinc-400">
                  <tr>
                    <th className="px-5 py-3">Date / time</th>
                    <th className="px-5 py-3">Hospital</th>
                    <th className="px-5 py-3">Salesperson</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Expected demand</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="align-top transition hover:bg-white/10">
                      <td className="px-5 py-3 whitespace-nowrap">
                        {formatDate(entry.entryDate)}
                        {entry.entryTime ? <span className="block text-xs text-zinc-400">{entry.entryTime}</span> : null}
                      </td>
                      <td className="px-5 py-3 font-semibold">
                        {entry.place}
                        {entry.note ? <span className="block text-xs font-normal text-zinc-400">{entry.note}</span> : null}
                      </td>
                      <td className="px-5 py-3 text-zinc-400">{entry.salespersonEmail}</td>
                      <td className="px-5 py-3">
                        {entry.done ? (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                            Visited
                          </span>
                        ) : (
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
                            Planned
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {entry.demandExpected ? (
                          <div>
                            <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-xs font-semibold text-brand-300">
                              Demand expected
                            </span>
                            {entry.demandNote ? (
                              <span className="mt-1 block text-xs text-zinc-400">{entry.demandNote}</span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end">
                          <button type="button" onClick={() => handleDelete(entry.id)} className="btn-danger btn-sm">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-zinc-400">
              No visits{selectedUserId || dateFilter ? ' for this filter' : ''} yet. Use “Assign visit”.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

export default FinanceSchedulePage;
