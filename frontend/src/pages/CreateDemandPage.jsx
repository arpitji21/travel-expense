import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLoading } from '../components/Loader';
import { createDemand, fetchStock } from '../lib/salesApi';

function CreateDemandPage() {
  const navigate = useNavigate();
  const [stock, setStock] = useState([]);
  const [loadingStock, setLoadingStock] = useState(true);
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [stockItemId, setStockItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStock()
      .then(setStock)
      .catch(() => setStock([]))
      .finally(() => setLoadingStock(false));
  }, []);

  const selected = useMemo(
    () => stock.find((item) => String(item.id) === String(stockItemId)) || null,
    [stock, stockItemId]
  );
  const available = selected ? selected.quantity : 0;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!stockItemId) {
      setError('Please choose a product from company stock.');
      return;
    }
    if (Number(quantity) > available) {
      setError(`Only ${available} ${selected?.unit || 'units'} available.`);
      return;
    }

    setSaving(true);
    try {
      await createDemand({
        hospitalName,
        hospitalAddress,
        stockItemId: Number(stockItemId),
        quantity: Number(quantity),
        note
      });
      navigate('/demands');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save demand.');
      setSaving(false);
    }
  }

  if (loadingStock) {
    return <PageLoading label="Loading stock..." />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">New demand</p>
        <h2 className="text-3xl font-extrabold tracking-tight">Record a hospital demand</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Book a product from company stock for a hospital. The quantity is deducted from available
          stock so other salespeople see what's left.
        </p>
      </div>

      {stock.length === 0 ? (
        <div className="glass-card p-6 text-sm text-zinc-300">
          There's no company stock yet, so there's nothing to book. Ask the finance department to add
          stock first.
          <div className="mt-4">
            <button type="button" onClick={() => navigate('/demands')} className="btn-ghost">
              Back to demands
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card space-y-4 p-6">
          <label className="block">
            <span className="field-label">Hospital name</span>
            <input
              value={hospitalName}
              onChange={(event) => setHospitalName(event.target.value)}
              required
              className="input"
              placeholder="e.g. City General Hospital"
            />
          </label>

          <label className="block">
            <span className="field-label">Hospital address (optional)</span>
            <input
              value={hospitalAddress}
              onChange={(event) => setHospitalAddress(event.target.value)}
              className="input"
              placeholder="e.g. 12 Main Road, Sector 4"
            />
          </label>

          <label className="block">
            <span className="field-label">Product (from company stock)</span>
            <select
              value={stockItemId}
              onChange={(event) => setStockItemId(event.target.value)}
              required
              className="input"
            >
              <option value="">Select a product</option>
              {stock.map((item) => (
                <option key={item.id} value={item.id} disabled={item.quantity <= 0}>
                  {item.product}
                  {item.supplier ? ` — ${item.supplier}` : ''} (available: {item.quantity} {item.unit || 'units'})
                  {item.quantity <= 0 ? ' — out of stock' : ''}
                </option>
              ))}
            </select>
            {selected ? (
              <span className={`mt-1.5 block text-xs ${available > 0 ? 'text-zinc-400' : 'text-rose-400'}`}>
                {available} {selected.unit || 'units'} available.
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="field-label">Quantity</span>
            <input
              type="number"
              min="1"
              max={available || undefined}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
              className="input"
            />
          </label>

          <label className="block">
            <span className="field-label">Note (optional)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              className="input"
              placeholder="Any extra context for finance"
            />
          </label>

          {error ? <p className="text-sm font-medium text-rose-400">{error}</p> : null}

          <div className="flex gap-2">
            <button type="submit" disabled={saving || available <= 0} className="btn-primary">
              {saving ? 'Saving...' : 'Book demand'}
            </button>
            <button type="button" onClick={() => navigate('/demands')} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreateDemandPage;
