import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLoading } from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { deleteDemand, fetchDemands } from '../lib/salesApi';
import { formatDate } from '../lib/formatters';

function DemandsPage() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadDemands() {
    setLoading(true);
    const data = await fetchDemands();
    setDemands(data);
    setLoading(false);
  }

  useEffect(() => {
    loadDemands();
  }, []);

  async function handleDelete(demandId) {
    setMessage('');
    try {
      await deleteDemand(demandId);
      await loadDemands();
      setMessage('Demand deleted.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to delete demand.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Demands</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Hospital demands</h2>
        </div>
        <Link to="/demands/new" className="btn-primary">
          Add demand
        </Link>
      </div>

      {message ? (
        <p className="rounded-xl border border-zinc-200 bg-white/70 px-3 py-2 text-sm text-zinc-700">{message}</p>
      ) : null}

      {loading ? (
        <PageLoading label="Loading demands..." />
      ) : (
        <section className="glass-card">
          {demands.length ? (
            <div className="divide-y divide-zinc-200/70">
              {demands.map((demand) => (
                <div key={demand.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold">{demand.hospitalName}</p>
                      <StatusBadge status={demand.status} />
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">
                      {demand.product} &times; {demand.quantity}
                    </p>
                    {demand.hospitalAddress ? (
                      <p className="mt-1 text-sm text-zinc-500">{demand.hospitalAddress}</p>
                    ) : null}
                    {demand.note ? <p className="mt-1 text-sm text-zinc-500">{demand.note}</p> : null}
                    <p className="mt-1 text-xs text-zinc-400">Recorded {formatDate(demand.createdAt)}</p>
                  </div>
                  <div>
                    <button type="button" onClick={() => handleDelete(demand.id)} className="btn-danger btn-sm">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">No demands recorded yet.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default DemandsPage;
