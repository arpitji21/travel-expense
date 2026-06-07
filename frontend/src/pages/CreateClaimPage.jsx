import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClaim } from '../lib/salesApi';

function CreateClaimPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    purpose: '',
    currency: 'USD'
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const claim = await createClaim(form);
      navigate(`/claims/${claim.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create claim.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Create Claim</p>
      <h2 className="text-3xl font-bold">Start a travel claim</h2>

      <form onSubmit={handleSubmit} className="mt-6 rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-zinc-700">
          Claim title
          <input
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            placeholder="Client visit to Chicago"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-zinc-700">
          Purpose
          <textarea
            value={form.purpose}
            onChange={(event) => updateField('purpose', event.target.value)}
            className="mt-2 min-h-28 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            placeholder="Meeting client stakeholders and conducting product demos"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-zinc-700">
          Currency
          <input
            value={form.currency}
            maxLength={3}
            onChange={(event) => updateField('currency', event.target.value.toUpperCase())}
            className="mt-2 w-28 rounded-md border border-zinc-300 px-3 py-2 text-sm uppercase outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </label>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {saving ? 'Creating...' : 'Create Claim'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/claims')}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateClaimPage;
