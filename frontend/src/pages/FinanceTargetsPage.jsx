import { useEffect, useMemo, useState } from 'react';
import { PageLoading } from '../components/Loader';
import { deleteTarget, fetchSalespeople, fetchTargets, upsertTarget } from '../lib/salesApi';

const currentMonth = () => new Date().toISOString().slice(0, 7);

function Progress({ value, target }) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : value > 0 ? 100 : 0;
  return (
    <div className="min-w-[8rem]">
      <div className="flex justify-between text-xs text-zinc-400">
        <span className="font-semibold text-zinc-200">
          {value}
          <span className="text-zinc-500"> / {target || '—'}</span>
        </span>
        {target > 0 ? <span>{pct}%</span> : null}
      </div>
      <div className="mt-1 h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-brand-gradient" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FinanceTargetsPage() {
  const [salespeople, setSalespeople] = useState([]);
  const [targets, setTargets] = useState([]);
  const [period, setPeriod] = useState(currentMonth());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ userId: '', visitsTarget: '', demandsTarget: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSalespeople().then(setSalespeople).catch(() => setSalespeople([]));
  }, []);

  async function load() {
    setLoading(true);
    const data = await fetchTargets({ period });
    setTargets(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [period]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    if (!form.userId) {
      setMessage('Choose a salesperson.');
      return;
    }
    setSaving(true);
    try {
      await upsertTarget({
        userId: Number(form.userId),
        period,
        visitsTarget: Number(form.visitsTarget || 0),
        demandsTarget: Number(form.demandsTarget || 0)
      });
      await load();
      setForm({ userId: '', visitsTarget: '', demandsTarget: '' });
      setMessage('Target saved.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to save target.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setMessage('');
    try {
      await deleteTarget(id);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to delete target.');
    }
  }

  // Rank by total actual activity (visits + demands) for the month.
  const leaderboard = useMemo(
    () => [...targets].sort((a, b) => b.visitsDone + b.demandsBooked - (a.visitsDone + a.demandsBooked)),
    [targets]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Targets</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Sales targets &amp; performance</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Set monthly goals and track visits completed and demands booked.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
          Month
          <input type="month" value={period} onChange={(event) => setPeriod(event.target.value)} className="input mt-0" />
        </label>
      </div>

      {message ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-200">{message}</p>
      ) : null}

      <form onSubmit={handleSubmit} className="glass-card grid gap-3 p-4 sm:grid-cols-[1.5fr_1fr_1fr_auto]">
        <select
          value={form.userId}
          onChange={(event) => setField('userId', event.target.value)}
          required
          className="input mt-0"
        >
          <option value="">Select salesperson</option>
          {salespeople.map((person) => (
            <option key={person.id} value={person.id}>
              {person.email}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          value={form.visitsTarget}
          onChange={(event) => setField('visitsTarget', event.target.value)}
          placeholder="Visits target"
          className="input mt-0"
        />
        <input
          type="number"
          min="0"
          value={form.demandsTarget}
          onChange={(event) => setField('demandsTarget', event.target.value)}
          placeholder="Demands target"
          className="input mt-0"
        />
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Set target'}
        </button>
      </form>

      {loading ? (
        <PageLoading label="Loading targets..." />
      ) : targets.length ? (
        <section className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Salesperson</th>
                  <th className="px-5 py-3">Visits done / target</th>
                  <th className="px-5 py-3">Demands booked / target</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {leaderboard.map((target, index) => (
                  <tr key={target.id} className="transition hover:bg-white/10">
                    <td className="px-5 py-3 font-bold text-zinc-400">{index + 1}</td>
                    <td className="px-5 py-3 font-semibold">{target.salespersonEmail}</td>
                    <td className="px-5 py-3">
                      <Progress value={target.visitsDone} target={target.visitsTarget} />
                    </td>
                    <td className="px-5 py-3">
                      <Progress value={target.demandsBooked} target={target.demandsTarget} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end">
                        <button type="button" onClick={() => handleDelete(target.id)} className="btn-danger btn-sm">
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="glass-card">
          <p className="px-5 py-10 text-center text-sm text-zinc-400">
            No targets set for this month. Use the form above to set one.
          </p>
        </section>
      )}
    </div>
  );
}

export default FinanceTargetsPage;
