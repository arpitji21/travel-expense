import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLoading } from '../components/Loader';
import ScheduleList from '../components/ScheduleList';
import StatusBadge from '../components/StatusBadge';
import { fetchDemands, fetchExpenses, fetchSchedule, fetchTargets } from '../lib/salesApi';
import { formatCurrency, formatDate } from '../lib/formatters';

const currentMonth = () => new Date().toISOString().slice(0, 7);

function TargetBar({ label, value, target }) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : value > 0 ? 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-semibold text-zinc-100">
          {value}
          <span className="text-zinc-500"> / {target || '—'}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-brand-gradient" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, to, linkText, sub }) {
  return (
    <div className="stat-card">
      <p className="text-sm font-medium text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight gradient-text">{value}</p>
      {sub ? <p className="mt-1 text-sm text-zinc-400">{sub}</p> : null}
      {to ? (
        <Link to={to} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-400 hover:text-brand-300">
          {linkText} <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}

function DashboardPage() {
  const [demands, setDemands] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDemands(),
      fetchExpenses(),
      fetchSchedule(),
      fetchTargets({ period: currentMonth() })
    ])
      .then(([demandList, expenseList, scheduleEntries, targetList]) => {
        setDemands(demandList);
        setExpenses(expenseList);
        setSchedule(scheduleEntries);
        setTarget(targetList[0] || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const reimbursedTotal = useMemo(
    () =>
      expenses
        .filter((expense) => expense.status === 'reimbursed')
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [expenses]
  );

  const todaySchedule = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return schedule.filter((entry) => entry.entryDate === today);
  }, [schedule]);

  if (loading) {
    return <PageLoading label="Loading your dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Dashboard</p>
        <h2 className="text-3xl font-extrabold tracking-tight">Your activity</h2>
      </div>

      <section className="glass-card">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="section-title">Today&apos;s visits</h3>
          <Link to="/schedule" className="text-sm font-semibold text-brand-400 hover:text-brand-300">
            View visits
          </Link>
        </div>
        <div className="px-5 py-4">
          <ScheduleList entries={todaySchedule} emptyText="No visits assigned for today. Finance assigns your visits." />
        </div>
      </section>

      {target ? (
        <section className="glass-card p-5">
          <h3 className="section-title">This month&apos;s targets</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TargetBar label="Visits completed" value={target.visitsDone} target={target.visitsTarget} />
            <TargetBar label="Demands booked" value={target.demandsBooked} target={target.demandsTarget} />
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Hospital demands" value={demands.length} to="/demands" linkText="View demands" />
        <StatCard label="Expenses raised" value={expenses.length} to="/expenses" linkText="View expenses" />
        <StatCard label="Reimbursed" value={formatCurrency(reimbursedTotal)} sub="Total paid back to you" />
      </section>

      <section className="glass-card">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="section-title">Recent demands</h3>
          <Link to="/demands/new" className="text-sm font-semibold text-brand-400 hover:text-brand-300">
            Add demand
          </Link>
        </div>
        {demands.length ? (
          <ul className="divide-y divide-white/10">
            {demands.slice(0, 5).map((demand) => (
              <li key={demand.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-semibold">{demand.hospitalName}</p>
                  <p className="text-sm text-zinc-400">
                    {demand.product} &times; {demand.quantity}
                  </p>
                </div>
                <StatusBadge status={demand.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-zinc-400">No demands recorded yet.</p>
        )}
      </section>

      <section className="glass-card">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="section-title">Recent expenses</h3>
          <Link to="/expenses/new" className="text-sm font-semibold text-brand-400 hover:text-brand-300">
            Add expense
          </Link>
        </div>
        {expenses.length ? (
          <ul className="divide-y divide-white/10">
            {expenses.slice(0, 5).map((expense) => (
              <li key={expense.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-semibold">{expense.category}</p>
                  <p className="text-sm text-zinc-400">{formatDate(expense.expenseDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatCurrency(expense.amount, expense.currency)}</span>
                  <StatusBadge status={expense.status} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-zinc-400">No expenses raised yet.</p>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
