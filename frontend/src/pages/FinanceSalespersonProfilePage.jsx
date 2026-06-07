import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageLoading } from '../components/Loader';
import ScheduleList from '../components/ScheduleList';
import StatusBadge from '../components/StatusBadge';
import { buildAssetUrl } from '../lib/apiClient';
import {
  approveExpense,
  fetchDemands,
  fetchExpenses,
  fetchSchedule,
  fetchUser,
  reimburseExpense,
  rejectExpense
} from '../lib/salesApi';
import { formatCurrency, formatDate } from '../lib/formatters';

function FinanceSalespersonProfilePage() {
  const { userId } = useParams();
  const [person, setPerson] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [user, scheduleEntries, expenseList, demandList] = await Promise.all([
      fetchUser(userId),
      fetchSchedule(userId),
      fetchExpenses(userId),
      fetchDemands(userId)
    ]);
    setPerson(user);
    setSchedule(scheduleEntries);
    setExpenses(expenseList);
    setDemands(demandList);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(action, expenseId, successMessage) {
    setMessage('');
    try {
      await action(expenseId);
      await load();
      setMessage(successMessage);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to update expense.');
    }
  }

  if (loading) {
    return <PageLoading label="Loading profile..." />;
  }

  if (!person) {
    return <p className="text-sm text-zinc-500">Salesperson not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Link to="/salespeople" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
        ← Back to salespeople
      </Link>

      <div className="glass-card flex items-center gap-4 p-6">
        <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-brand-gradient text-lg font-bold text-white">
          {(person.email || '?').slice(0, 2).toUpperCase()}
        </span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Salesperson profile</p>
          <h2 className="text-2xl font-extrabold tracking-tight">{person.email}</h2>
        </div>
      </div>

      {message ? (
        <p className="rounded-xl border border-zinc-200 bg-white/70 px-3 py-2 text-sm text-zinc-700">{message}</p>
      ) : null}

      <section className="glass-card p-6">
        <h3 className="section-title">Daily schedule</h3>
        <div className="mt-4">
          <ScheduleList entries={schedule} emptyText="This salesperson has no schedule entries." />
        </div>
      </section>

      <section className="glass-card p-6">
        <h3 className="section-title">Reimbursement bills</h3>
        <div className="mt-4 space-y-3">
          {expenses.length ? (
            expenses.map((expense) => (
              <div key={expense.id} className="rounded-xl border border-zinc-200/70 bg-white/60 p-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
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
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500">No expenses raised.</p>
          )}
        </div>
      </section>

      <section className="glass-card p-6">
        <h3 className="section-title">Hospital demands</h3>
        <div className="mt-4 space-y-2">
          {demands.length ? (
            demands.map((demand) => (
              <div
                key={demand.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200/70 bg-white/60 p-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold">{demand.hospitalName}</p>
                    <StatusBadge status={demand.status} />
                  </div>
                  {demand.hospitalAddress ? (
                    <p className="text-sm text-zinc-500">{demand.hospitalAddress}</p>
                  ) : null}
                  <p className="text-sm text-zinc-600">
                    {demand.product} &times; {demand.quantity}
                  </p>
                </div>
                <span className="text-sm text-zinc-500">{formatDate(demand.createdAt)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500">No demands recorded.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default FinanceSalespersonProfilePage;
