import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExpense } from '../lib/salesApi';

function CreateExpensePage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Metro');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [description, setDescription] = useState('');
  const [receiptLink, setReceiptLink] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!receiptLink.trim()) {
      setError('Please paste a link to your bill (e.g. a Google Drive link).');
      return;
    }

    setSaving(true);

    try {
      await createExpense({
        category,
        amount: Number(amount),
        expenseDate,
        description,
        receiptUrl: receiptLink.trim()
      });
      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save expense.');
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">New expense</p>
        <h2 className="text-3xl font-extrabold tracking-tight">Submit a bill</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Upload your bill photo to Google Drive, then paste its share link here along with the amount
          and date. The link is stored permanently for finance to review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card space-y-4 p-6">
        <label className="block">
          <span className="field-label">Category</span>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
            className="input"
            placeholder="e.g. Metro, Travel, Hotel"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              className="input"
              placeholder="0.00"
            />
          </label>

          <label className="block">
            <span className="field-label">Date</span>
            <input
              type="date"
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
              required
              className="input"
            />
          </label>
        </div>

        <label className="block">
          <span className="field-label">Description (optional)</span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="input"
            placeholder="e.g. Station A to Station B"
          />
        </label>

        <label className="block">
          <span className="field-label">Bill link (Google Drive, etc.)</span>
          <input
            value={receiptLink}
            onChange={(event) => setReceiptLink(event.target.value)}
            required
            className="input"
            placeholder="https://drive.google.com/..."
          />
          <span className="mt-1.5 block text-xs text-zinc-400">
            Share the file as “Anyone with the link → Viewer” so finance can open it.
          </span>
        </label>

        {error ? <p className="text-sm font-medium text-rose-400">{error}</p> : null}

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Submit expense'}
          </button>
          <button type="button" onClick={() => navigate('/expenses')} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateExpensePage;
