import { useEffect, useState } from 'react';
import { PageLoading } from '../components/Loader';
import { fetchStockAllocations } from '../lib/salesApi';
import { formatDate } from '../lib/formatters';

function FinanceAllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadAllocations() {
    setLoading(true);
    try {
      const data = await fetchStockAllocations();
      setAllocations(data);
    } catch (err) {
      setMessage('Failed to load allocation records.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllocations();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Allocations</p>
        <h2 className="text-3xl font-extrabold tracking-tight">Stock Allocation Records</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Track all stock distributions from vendors to your field sales team.
        </p>
      </div>

      {message ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-200">{message}</p>
      ) : null}

      {loading ? (
        <PageLoading label="Loading records..." />
      ) : allocations.length ? (
        <section className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Distributor</th>
                  <th className="px-5 py-3">Recipient (Sales)</th>
                  <th className="px-5 py-3">Qty</th>
                  <th className="px-5 py-3">Allocated By</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {allocations.map((a) => (
                  <tr key={a.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{a.productName}</p>
                      <p className="text-xs text-zinc-500">{a.sku}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-400">{a.distributorEmail}</td>
                    <td className="px-5 py-4 text-zinc-300 font-medium">{a.salespersonEmail}</td>
                    <td className="px-5 py-4 font-bold text-brand-400">{a.quantityAllocated}</td>
                    <td className="px-5 py-4 text-xs text-zinc-500">{a.financeUserEmail}</td>
                    <td className="px-5 py-4 text-xs text-zinc-500">{formatDate(a.allocatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="glass-card">
          <p className="px-5 py-10 text-center text-sm text-zinc-400">
            No stock allocations have been recorded yet.
          </p>
        </section>
      )}
    </div>
  );
}

export default FinanceAllocationsPage;
