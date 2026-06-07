import { useEffect, useMemo, useState } from 'react';
import { PageLoading } from '../components/Loader';
import SalespersonFilter from '../components/SalespersonFilter';
import StatusBadge from '../components/StatusBadge';
import { buildAssetUrl } from '../lib/apiClient';
import {
  approveExpense,
  fetchExpenses,
  fetchSalespeople,
  reimburseExpense,
  rejectExpense
} from '../lib/salesApi';
import { formatCurrency, formatDate } from '../lib/formatters';

function FinanceExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [salespeople, setSalespeople] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadExpenses(userId) {
    setLoading(true);
    const data = await fetchExpenses(userId || undefined);
    setExpenses(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchSalespeople().then(setSalespeople).catch(() => setSalespeople([]));
  }, []);

  useEffect(() => {
    loadExpenses(selectedUserId);
  }, [selectedUserId]);

  const total = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [expenses]
  );

  async function runAction(action, expenseId, successMessage) {
    setMessage('');
    try {
      await action(expenseId);
      await loadExpenses(selectedUserId);
      setMessage(successMessage);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to update expense.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Expenses</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Expense claims</h2>
          <p className="mt-1 text-sm text-zinc-600">Total shown: {formatCurrency(total)}</p>
        </div>
        <SalespersonFilter salespeople={salespeople} value={selectedUserId} onChange={setSelectedUserId} />
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
                <div key={expense.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold">{expense.category}</p>
                      <StatusBadge status={expense.status} />
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">{expense.description || 'No description'}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-600">
                      <span className="font-semibold text-zinc-900">
                        {formatCurrency(expense.amount, expense.currency)}
                      </span>
                      <span>{formatDate(expense.expenseDate)}</span>
                      <span>{expense.salespersonEmail}</span>
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
                        <span className="text-rose-600">No bill</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {expense.status === 'submitted' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => runAction(approveExpense, expense.id, 'Expense approved.')}
                          className="btn-success btn-sm"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => runAction(rejectExpense, expense.id, 'Expense rejected.')}
                          className="btn-danger btn-sm"
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
                    {expense.status === 'approved' ? (
                      <button
                        type="button"
                        onClick={() => runAction(reimburseExpense, expense.id, 'Expense marked reimbursed.')}
                        className="btn-primary btn-sm"
                      >
                        Mark Reimbursed
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">No expenses found.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default FinanceExpensesPage;
