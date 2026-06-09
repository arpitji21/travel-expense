import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExpense, uploadReceipt } from '../lib/salesApi';
import { Spinner } from '../components/Loader';

function CreateExpensePage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Metro');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleFileChange(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!file) {
      setError('Please upload a photo of your bill.');
      return;
    }

    setSaving(true);

    try {
      // 1. Create the expense record
      const expense = await createExpense({
        category,
        amount: Number(amount),
        expenseDate,
        description
      });

      // 2. Upload the actual receipt photo
      await uploadReceipt(expense.id, file);

      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save expense and upload bill.');
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">New expense</p>
        <h2 className="text-3xl font-extrabold tracking-tight">Submit a bill</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Upload a photo or scan of your bill (e.g. metro ticket, restaurant bill).
          It will be stored permanently for finance to review and reimburse.
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

        <div className="space-y-2">
          <span className="field-label">Bill Photo / Receipt</span>
          <div className="relative">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="bill-upload"
            />
            <label
              htmlFor="bill-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-8 transition hover:bg-white/[0.08]"
            >
              {previewUrl ? (
                <div className="text-center">
                  <img src={previewUrl} alt="Preview" className="mx-auto mb-3 max-h-48 rounded-lg shadow-lg" />
                  <p className="text-sm font-medium text-brand-400">Change photo</p>
                </div>
              ) : (
                <>
                  <svg className="mb-3 h-10 w-10 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-zinc-300">Click to upload photo</p>
                  <p className="mt-1 text-xs text-zinc-500">JPG, PNG or PDF up to 25MB</p>
                </>
              )}
            </label>
          </div>
          {file && <p className="text-xs text-zinc-400">Selected: {file.name}</p>}
        </div>

        {error ? <p className="text-sm font-medium text-rose-400">{error}</p> : null}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary min-w-[140px]">
            {saving ? (
              <>
                <Spinner tone="white" className="mr-2 h-4 w-4" />
                Uploading...
              </>
            ) : (
              'Submit expense'
            )}
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
