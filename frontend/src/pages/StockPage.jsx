import { useEffect, useMemo, useState } from 'react';
import { PageLoading } from '../components/Loader';
import { fetchStock } from '../lib/salesApi';
import { formatDate } from '../lib/formatters';

function groupBySupplier(items) {
  const groups = [];
  const index = {};

  items.forEach((item) => {
    if (!(item.supplier in index)) {
      index[item.supplier] = groups.length;
      groups.push({ supplier: item.supplier, items: [] });
    }
    groups[index[item.supplier]].items.push(item);
  });

  return groups;
}

function StockPage() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock()
      .then(setStock)
      .catch(() => setStock([]))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => groupBySupplier(stock), [stock]);
  const totalUnits = useMemo(
    () => stock.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [stock]
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Stock</p>
        <h2 className="text-3xl font-extrabold tracking-tight">Company stock</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Stock available across the company — what's left after demands are booked. {stock.length} item
          {stock.length === 1 ? '' : 's'} · {totalUnits} units available.
        </p>
      </div>

      {loading ? (
        <PageLoading label="Loading stock..." />
      ) : groups.length ? (
        <div className="space-y-5">
          {groups.map((group) => (
            <section key={group.supplier} className="glass-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-5 py-3">
                <p className="font-semibold">{group.supplier}</p>
                <span className="text-xs uppercase tracking-wide text-zinc-400">Supplier</span>
              </div>
              <div className="divide-y divide-white/10">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div>
                      <p className="font-medium">{item.product}</p>
                      {item.note ? <p className="mt-0.5 text-xs text-zinc-400">{item.note}</p> : null}
                      <p className="mt-0.5 text-xs text-zinc-400">Updated {formatDate(item.updatedAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-zinc-100">{item.quantity}</p>
                      <p className="text-xs text-zinc-400">{item.unit || 'units'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="glass-card">
          <p className="px-5 py-10 text-center text-sm text-zinc-400">
            No stock in the company yet. Finance will add it here.
          </p>
        </section>
      )}
    </div>
  );
}

export default StockPage;
