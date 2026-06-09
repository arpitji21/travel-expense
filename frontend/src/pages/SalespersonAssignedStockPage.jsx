import { useEffect, useState } from 'react';
import { PageLoading } from '../components/Loader';
import { fetchMyAssignedStock } from '../lib/salesApi';
import { formatDate } from '../lib/formatters';

function SalespersonAssignedStockPage() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadAssignedStock() {
    setLoading(true);
    try {
      const data = await fetchMyAssignedStock();
      setAllocations(data);
    } catch (err) {
      setMessage('Failed to load assigned stock.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignedStock();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Inventory</p>
        <h2 className="text-3xl font-extrabold tracking-tight">Assigned Stock</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Products allocated to you by finance for your sales visits.
        </p>
      </div>

      {message ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-200">{message}</p>
      ) : null}

      {loading ? (
        <PageLoading label="Loading stock..." />
      ) : allocations.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {allocations.map((a) => (
            <div key={a.id} className="glass-card flex flex-col p-5">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                  {a.sku || 'SKU: —'}
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">{a.productName}</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  From Distributor: <span className="text-zinc-200">{a.distributorEmail}</span>
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="rounded-lg bg-white/5 px-3 py-1">
                    <p className="text-[10px] uppercase text-zinc-500">Qty Received</p>
                    <p className="text-lg font-black text-brand-400">{a.quantityAllocated}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-zinc-500 text-right">Received On</p>
                    <p className="text-sm font-medium text-zinc-300">{formatDate(a.allocatedAt)}</p>
                  </div>
                </div>
              </div>
              {a.remarks && (
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-xs italic text-zinc-500">“{a.remarks}”</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <section className="glass-card">
          <p className="px-5 py-10 text-center text-sm text-zinc-400">
            No stock has been assigned to you yet.
          </p>
        </section>
      )}
    </div>
  );
}

export default SalespersonAssignedStockPage;
