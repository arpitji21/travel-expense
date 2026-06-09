import { useEffect, useState } from 'react';
import { PageLoading, Spinner } from '../components/Loader';
import { createDistributorStock, deleteDistributorStock, fetchDistributorStock, updateDistributorStock } from '../lib/salesApi';
import { formatCurrency, formatDate } from '../lib/formatters';

function StockForm({ stock, onSaved, onCancel }) {
  const [productName, setProductName] = useState(stock?.productName || '');
  const [sku, setSku] = useState(stock?.sku || '');
  const [quantity, setQuantity] = useState(stock?.quantityAvailable || 0);
  const [unitPrice, setUnitPrice] = useState(stock?.unitPrice || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      productName,
      sku,
      quantityAvailable: Number(quantity),
      unitPrice: unitPrice ? Number(unitPrice) : null
    };

    try {
      if (stock) {
        await updateDistributorStock(stock.id, payload);
      } else {
        await createDistributorStock(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save stock item.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card mb-6 animate-fade-in space-y-4 p-5 text-left">
      <h3 className="font-bold text-lg">{stock ? 'Edit Stock' : 'Add New Stock'}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="field-label">Product Name</span>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            className="input"
            placeholder="e.g. Surgical Gloves (Box)"
          />
        </label>
        <label className="block">
          <span className="field-label">SKU (optional)</span>
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="input"
            placeholder="e.g. SG-100"
          />
        </label>
        <label className="block">
          <span className="field-label">Quantity Available</span>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="input"
          />
        </label>
        <label className="block">
          <span className="field-label">Unit Price (INR)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            className="input"
            placeholder="0.00"
          />
        </label>
      </div>
      {error && <p className="text-sm font-medium text-rose-400">{error}</p>}
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? <Spinner tone="white" className="h-4 w-4" /> : stock ? 'Update Stock' : 'Add Stock'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}

function DistributorInventoryPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingStock, setEditingStock] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  async function loadStocks() {
    setLoading(true);
    try {
      const data = await fetchDistributorStock();
      setStocks(data);
    } catch (err) {
      setMessage('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStocks();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this stock item?')) return;
    try {
      await deleteDistributorStock(id);
      loadStocks();
    } catch (err) {
      alert('Failed to delete stock item.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Inventory</p>
          <h2 className="text-3xl font-extrabold tracking-tight">My Stock</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Maintain your available product stock. Finance allocates this stock to salespeople.
          </p>
        </div>
        {!showAddForm && !editingStock && (
          <button onClick={() => setShowAddForm(true)} className="btn-primary flex-none">
            Add Stock
          </button>
        )}
      </div>

      {message ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-200">{message}</p>
      ) : null}

      {(showAddForm || editingStock) && (
        <StockForm
          stock={editingStock}
          onSaved={() => {
            setShowAddForm(false);
            setEditingStock(null);
            loadStocks();
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingStock(null);
          }}
        />
      )}

      {loading ? (
        <PageLoading label="Loading inventory..." />
      ) : stocks.length ? (
        <section className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="px-5 py-3">Product Name</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Available</th>
                  <th className="px-5 py-3">Unit Price</th>
                  <th className="px-5 py-3">Last Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {stocks.map((item) => (
                  <tr key={item.id} className="transition hover:bg-white/[0.02]">
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
                    <td className="px-5 py-4 text-xs text-zinc-500">{formatDate(item.updatedAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingStock(item)}
                          className="text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Delete
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
            Your inventory is empty. Click “Add Stock” to start.
          </p>
        </section>
      )}
    </div>
  );
}

export default DistributorInventoryPage;
