import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExpense } from '../lib/salesApi';

function CreateExpensePage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Metro');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [receiptLink, setReceiptLink] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!receiptLink.trim()) {
      setError('Please paste a Google Drive link to your bill.');
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
      console.error('Expense create error:', err);
      const serverMsg = err.response?.data?.message;
      const serverErr = err.response?.data?.error;
      setError(serverErr || serverMsg || err.message || 'Failed to save expense details.');
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">New expense</p>
        <h2 className="text-3xl font-extrabold tracking-tight">Submit a bill</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Upload your bill to your personal Google Drive, then paste the **Share Link** below. 
          The link is stored permanently for finance to review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card space-y-5 p-6">
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
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="input min-h-[80px] py-2"
            placeholder="e.g. Station A to Station B"
          />
        </label>

        <label className="block">
          <span className="field-label">Google Drive Bill Link</span>
          <input
            value={receiptLink}
            onChange={(event) => setReceiptLink(event.target.value)}
            required
            className="input"
            placeholder="https://drive.google.com/..."
          />
          <span className="mt-2 block text-xs text-zinc-400">
            Tip: Ensure the Drive link is shared as **“Anyone with the link → Viewer”** so the Finance department can open it.
          </span>
        </label>

        {error ? <p className="text-sm font-medium text-rose-400">{error}</p> : null}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Submitting...' : 'Submit expense'}
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
