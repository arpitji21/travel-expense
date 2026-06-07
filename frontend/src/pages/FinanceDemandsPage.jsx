import { useEffect, useState } from 'react';
import { PageLoading } from '../components/Loader';
import SalespersonFilter from '../components/SalespersonFilter';
import StatusBadge from '../components/StatusBadge';
import { fetchDemands, fetchSalespeople } from '../lib/salesApi';
import { formatDate } from '../lib/formatters';

function FinanceDemandsPage() {
  const [demands, setDemands] = useState([]);
  const [salespeople, setSalespeople] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalespeople().then(setSalespeople).catch(() => setSalespeople([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchDemands(selectedUserId || undefined)
      .then(setDemands)
      .finally(() => setLoading(false));
  }, [selectedUserId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Demands</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Hospital demand list</h2>
        </div>
        <SalespersonFilter salespeople={salespeople} value={selectedUserId} onChange={setSelectedUserId} />
      </div>

      {loading ? (
        <PageLoading label="Loading demands..." />
      ) : (
        <section className="glass-card overflow-hidden">
          {demands.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200/70 bg-white/50 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Hospital</th>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Qty</th>
                    <th className="px-5 py-3">Salesperson</th>
                    <th className="px-5 py-3">Recorded</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/70">
                  {demands.map((demand) => (
                    <tr key={demand.id} className="transition hover:bg-white/60">
                      <td className="px-5 py-3 font-semibold">
                        {demand.hospitalName}
                        {demand.hospitalAddress ? (
                          <span className="block text-xs font-normal text-zinc-500">{demand.hospitalAddress}</span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3">
                        {demand.product}
                        {demand.note ? <span className="block text-xs text-zinc-500">{demand.note}</span> : null}
                      </td>
                      <td className="px-5 py-3">{demand.quantity}</td>
                      <td className="px-5 py-3 text-zinc-600">{demand.salespersonEmail}</td>
                      <td className="px-5 py-3 text-zinc-600">{formatDate(demand.createdAt)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={demand.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">No demands found.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default FinanceDemandsPage;
