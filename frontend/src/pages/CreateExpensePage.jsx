import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExpense, uploadReceipt } from '../lib/salesApi';

function CreateExpensePage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Metro');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!file) {
      setError('Please attach an image of your bill.');
      return;
    }

    setSaving(true);

    try {
      const expense = await createExpense({
        category,
        amount: Number(amount),
        expenseDate,
        description
      });
      await uploadReceipt(expense.id, file);
      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save expense.');
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">New expense</p>
        <h2 className="text-3xl font-extrabold tracking-tight">Upload a bill</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Snap your metro bill (or any travel/other receipt), enter the amount and date, and submit it for reimbursement.
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
          <span className="field-label">Bill image</span>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            required
            className="input file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
          />
        </label>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Uploading...' : 'Submit expense'}
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
