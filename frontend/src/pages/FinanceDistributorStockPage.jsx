import { useEffect, useMemo, useState } from 'react';
import { PageLoading, Spinner } from '../components/Loader';
import { allocateStock, fetchDistributorStock, fetchSalespeople } from '../lib/salesApi';
import { formatCurrency, formatDate } from '../lib/formatters';

function AllocationForm({ stock, salespeople, onAllocated, onCancel }) {
  const [salespersonId, setSalespersonId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!salespersonId) {
      setError('Please select a salesperson.');
      return;
    }

    if (quantity > stock.quantityAvailable) {
      setError(`Cannot allocate more than available (${stock.quantityAvailable}).`);
      return;
    }

    setSubmitting(true);
    try {
      await allocateStock({
        stockId: stock.id,
        salespersonId: Number(salespersonId),
        quantityAllocated: Number(quantity),
        remarks
      });
      onAllocated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to allocate stock.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card mb-6 animate-fade-in space-y-4 p-5 text-left border-brand-500/30">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-brand-400">Allocate: {stock.productName}</h3>
        <p className="text-xs text-zinc-400">From: {stock.distributorEmail}</p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">Salesperson</span>
          <select
            value={salespersonId}
            onChange={(e) => setSalespersonId(e.target.value)}
            required
            className="input"
          >
            <option value="">Select a salesperson...</option>
            {salespeople.map((s) => (
              <option key={s.id} value={s.id}>{s.email}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Quantity to Allocate (Available: {stock.quantityAvailable})</span>
          <input
            type="number"
            min="1"
            max={stock.quantityAvailable}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="input"
          />
        </label>
      </div>
      <label className="block">
        <span className="field-label">Remarks (optional)</span>
        <input
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="input"
          placeholder="e.g. For City Hospital visit"
        />
      </label>
      
      {error && <p className="text-sm font-medium text-rose-400">{error}</p>}
      
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? <Spinner tone="white" className="h-4 w-4" /> : 'Confirm Allocation'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}

function FinanceDistributorStockPage() {
  const [stocks, setStocks] = useState([]);
  const [salespeople, setSalespeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLowStock, setLowStock] = useState(false);
  const [message, setMessage] = useState('');
  const [allocatingStock, setAllocatingStock] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [stockData, salesData] = await Promise.all([
        fetchDistributorStock({ search, lowStock: filterLowStock }),
        fetchSalespeople()
      ]);
      setStocks(stockData);
      setSalespeople(salesData);
    } catch (err) {
      setMessage('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [search, filterLowStock]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Inventory</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Distributor Stocks</h2>
          <p className="mt-2 text-sm text-zinc-400">
            View all available stock from third-party distributors and allocate it to your field sales team.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input md:w-64"
            placeholder="Search products or SKU..."
          />
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10">
            <input
              type="checkbox"
              checked={filterLowStock}
              onChange={(e) => setLowStock(e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            Low Stock Only
          </label>
        </div>
      </div>

      {message ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-200">{message}</p>
      ) : null}

      {allocatingStock && (
        <AllocationForm
          stock={allocatingStock}
          salespeople={salespeople}
          onAllocated={() => {
            setAllocatingStock(null);
            setMessage('Stock successfully allocated to salesperson.');
            loadData();
          }}
          onCancel={() => setAllocatingStock(null)}
        />
      )}

      {loading ? (
        <PageLoading label="Fetching distributor stocks..." />
      ) : stocks.length ? (
        <section className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="px-5 py-3">Distributor</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Available</th>
                  <th className="px-5 py-3">Unit Price</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {stocks.map((item) => (
                  <tr key={item.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-5 py-4 text-xs font-medium text-zinc-400">{item.distributorEmail}</td>
                    <td className="px-5 py-4 font-semibold text-white">{item.productName}</td>
                    <td className="px-5 py-4 text-zinc-400">{item.sku || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`font-bold ${item.quantityAvailable < 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.quantityAvailable}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-300">
                      {item.unitPrice ? formatCurrency(item.unitPrice) : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setAllocatingStock(item)}
                        disabled={item.quantityAvailable === 0}
                        className="btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Allocate Stock
                      </button>
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
            No distributor stock found matching your search.
          </p>
        </section>
      )}
    </div>
  );
}

export default FinanceDistributorStockPage;
