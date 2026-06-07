import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLoading } from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { buildAssetUrl } from '../lib/apiClient';
import { deleteExpense, fetchExpenses } from '../lib/salesApi';
import { formatCurrency, formatDate } from '../lib/formatters';

function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadExpenses() {
    setLoading(true);
    const data = await fetchExpenses();
    setExpenses(data);
    setLoading(false);
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function handleDelete(expenseId) {
    setMessage('');
    try {
      await deleteExpense(expenseId);
      await loadExpenses();
      setMessage('Expense deleted.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to delete expense.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Expenses</p>
          <h2 className="text-3xl font-extrabold tracking-tight">My expense claims</h2>
        </div>
        <Link to="/expenses/new" className="btn-primary">
          Add expense
        </Link>
      </div>

      {message ? (
        <p className="rounded-xl border border-zinc-200 bg-white/70 px-3 py-2 text-sm text-zinc-700">{message}</p>
      ) : null}

      {loading ? (
        <PageLoading label="Loading expenses..." />
      ) : (
        <section className="glass-card">
          {expenses.length ? (
            <div className="divide-y divide-zinc-200/70">
              {expenses.map((expense) => (
                <div key={expense.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold">{expense.category}</p>
                      <StatusBadge status={expense.status} />
                    </div>
                    {expense.description ? (
                      <p className="mt-1 text-sm text-zinc-600">{expense.description}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-600">
                      <span className="font-semibold text-zinc-900">
                        {formatCurrency(expense.amount, expense.currency)}
                      </span>
                      <span>{formatDate(expense.expenseDate)}</span>
                      {expense.receiptUrl ? (
                        <a
                          href={buildAssetUrl(expense.receiptUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-brand-600 hover:text-brand-700"
                        >
                          View bill
                        </a>
                      ) : (
                        <span className="text-rose-600">No bill attached</span>
                      )}
                    </div>
                  </div>
                  <div>
                    {expense.status === 'submitted' ? (
                      <button type="button" onClick={() => handleDelete(expense.id)} className="btn-danger btn-sm">
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">No expenses raised yet.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default ExpensesPage;
