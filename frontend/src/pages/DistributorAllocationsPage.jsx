import { useEffect, useState } from 'react';
import { PageLoading } from '../components/Loader';
import { fetchStockAllocations } from '../lib/salesApi';
import { formatDate } from '../lib/formatters';

function DistributorAllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadAllocations() {
    setLoading(true);
    try {
      const data = await fetchStockAllocations();
      setAllocations(data);
    } catch {
      setMessage('Failed to load allocation history.');
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
        <h2 className="text-3xl font-extrabold tracking-tight">Stock Allocation History</h2>
        <p className="mt-2 text-sm text-zinc-400">
          View which salesperson received stock from your inventory, allocated by finance.
        </p>
      </div>

      {message ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-200">{message}</p>
      ) : null}

      {loading ? (
        <PageLoading label="Loading allocations..." />
      ) : allocations.length ? (
        <section className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Serial Number</th>
                  <th className="px-5 py-3">Salesperson</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Allocated Date</th>
                  <th className="px-5 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {allocations.map((a) => (
                  <tr key={a.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-semibold text-white">
                      {a.productName}
                      <span className="ml-2 text-xs font-normal text-zinc-500">{a.sku}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-brand-400 font-semibold">{a.serialNumber || '—'}</td>
                    <td className="px-5 py-4 text-zinc-300">{a.salespersonEmail}</td>
                    <td className="px-5 py-4 font-bold text-brand-400">{a.quantityAllocated}</td>
                    <td className="px-5 py-4 text-zinc-400">{formatDate(a.allocatedAt)}</td>
                    <td className="px-5 py-4 text-xs text-zinc-500 italic">{a.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="glass-card">
          <p className="px-5 py-10 text-center text-sm text-zinc-400">
            No stock has been allocated from your inventory yet.
          </p>
        </section>
      )}
    </div>
  );
}

export default DistributorAllocationsPage;
