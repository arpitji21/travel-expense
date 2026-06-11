import { useEffect, useMemo, useState } from 'react';
import { PageLoading } from '../components/Loader';
import { createStock, deleteStock, fetchStock, updateStock } from '../lib/salesApi';
import { formatDate } from '../lib/formatters';

const EMPTY_FORM = { id: null, supplier: '', product: '', serialNumber: '', quantity: '', unit: '', note: '' };

function FinanceStockPage() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadStock() {
    setLoading(true);
    const data = await fetchStock();
    setStock(data);
    setLoading(false);
  }

  useEffect(() => {
    loadStock();
  }, []);

  const totalUnits = useMemo(
    () => stock.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [stock]
  );

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startAdd() {
    setForm(EMPTY_FORM);
    setShowForm(true);
    setMessage('');
  }

  function startEdit(item) {
    setForm({
      id: item.id,
      supplier: item.supplier || '',
      product: item.product,
      serialNumber: item.serialNumber || '',
      quantity: String(item.quantity),
      unit: item.unit || '',
      note: item.note || ''
    });
    setShowForm(true);
    setMessage('');
  }

  function cancelForm() {
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const payload = {
      supplier: form.supplier.trim(),
      product: form.product.trim(),
      serialNumber: form.serialNumber.trim(),
      quantity: Number(form.quantity || 0),
      unit: form.unit.trim(),
      note: form.note.trim()
    };

    setSaving(true);
    try {
      if (form.id) {
        await updateStock(form.id, payload);
      } else {
        await createStock(payload);
      }
      await loadStock();
      cancelForm();
      setMessage(form.id ? 'Stock updated.' : 'Stock added.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to save stock.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(stockId) {
    setMessage('');
    try {
      await deleteStock(stockId);
      await loadStock();
      setMessage('Stock deleted.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to delete stock.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Stock</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Company stock</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Available across the company — drawn down as salespeople book demands. {stock.length} item
            {stock.length === 1 ? '' : 's'} · {totalUnits} units on hand.
          </p>
        </div>
        <button type="button" onClick={startAdd} className="btn-primary">
          Add stock
        </button>
      </div>

      {message ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-200">{message}</p>
      ) : null}

      {showForm ? (
        <form onSubmit={handleSubmit} className="glass-card space-y-4 p-6">
          <p className="section-title">{form.id ? 'Edit stock item' : 'Add stock item'}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="field-label">Product</span>
              <input
                value={form.product}
                onChange={(event) => setField('product', event.target.value)}
                required
                className="input"
                placeholder="e.g. Surgical Gloves (M)"
              />
            </label>
            <label className="block">
              <span className="field-label">Serial Number</span>
              <input
                value={form.serialNumber}
                onChange={(event) => setField('serialNumber', event.target.value)}
                required
                className="input"
                placeholder="e.g. SN-998877"
              />
            </label>
            <label className="block">
              <span className="field-label">Supplier / vendor (optional)</span>
              <input
                value={form.supplier}
                onChange={(event) => setField('supplier', event.target.value)}
                className="input"
                placeholder="e.g. MedSupply Co."
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="field-label">Quantity</span>
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(event) => setField('quantity', event.target.value)}
                  required
                  className="input"
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className="field-label">Unit</span>
                <input
                  value={form.unit}
                  onChange={(event) => setField('unit', event.target.value)}
                  className="input"
                  placeholder="boxes"
                />
              </label>
            </div>
            <label className="block">
              <span className="field-label">Note (optional)</span>
              <input
                value={form.note}
                onChange={(event) => setField('note', event.target.value)}
                className="input"
                placeholder="Batch no., expiry, etc."
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : form.id ? 'Save changes' : 'Add stock'}
            </button>
            <button type="button" onClick={cancelForm} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <PageLoading label="Loading stock..." />
      ) : (
        <section className="glass-card overflow-hidden">
          {stock.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-zinc-400">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Serial Number</th>
                    <th className="px-5 py-3">Supplier</th>
                    <th className="px-5 py-3">Available</th>
                    <th className="px-5 py-3">Updated</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {stock.map((item) => (
                    <tr key={item.id} className="transition hover:bg-white/10">
                      <td className="px-5 py-3 font-semibold">
                        {item.product}
                        {item.note ? <span className="block text-xs font-normal text-zinc-400">{item.note}</span> : null}
                      </td>
                      <td className="px-5 py-3 text-zinc-400">{item.serialNumber || '—'}</td>
                      <td className="px-5 py-3 text-zinc-400">{item.supplier || '—'}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={item.quantity <= 0 ? 'font-semibold text-rose-400' : 'font-semibold text-zinc-100'}>
                          {item.quantity}
                        </span>{' '}
                        <span className="text-xs text-zinc-400">{item.unit || 'units'}</span>
                      </td>
                      <td className="px-5 py-3 text-zinc-400">{formatDate(item.updatedAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => startEdit(item)} className="btn-ghost btn-sm">
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDelete(item.id)} className="btn-danger btn-sm">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-zinc-400">No stock yet. Use “Add stock”.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default FinanceStockPage;
