import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDemand } from '../lib/salesApi';

function CreateDemandPage() {
  const navigate = useNavigate();
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      await createDemand({
        hospitalName,
        hospitalAddress,
        product,
        quantity: Number(quantity),
        note
      });
      navigate('/demands');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save demand.');
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">New demand</p>
        <h2 className="text-3xl font-extrabold tracking-tight">Record a hospital demand</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Log a demand a hospital has raised so finance can see what is needed.
        </p>
      </div>

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
          <span className="field-label">Product</span>
          <input
            value={product}
            onChange={(event) => setProduct(event.target.value)}
            required
            className="input"
            placeholder="e.g. Surgical gloves"
          />
        </label>

        <label className="block">
          <span className="field-label">Quantity</span>
          <input
            type="number"
            min="1"
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

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save demand'}
          </button>
          <button type="button" onClick={() => navigate('/demands')} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateDemandPage;
