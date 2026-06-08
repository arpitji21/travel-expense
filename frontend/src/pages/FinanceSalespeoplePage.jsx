import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLoading } from '../components/Loader';
import { fetchSalespeople } from '../lib/salesApi';

function initials(email) {
  return (email || '?').slice(0, 2).toUpperCase();
}

function FinanceSalespeoplePage() {
  const [salespeople, setSalespeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalespeople()
      .then(setSalespeople)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Salespeople</p>
        <h2 className="text-3xl font-extrabold tracking-tight">Salesperson profiles</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Open a profile to review that person&apos;s daily schedule, expenses, and demands.
        </p>
      </div>

      {loading ? (
        <PageLoading label="Loading salespeople..." />
      ) : salespeople.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {salespeople.map((person) => (
            <Link
              key={person.id}
              to={`/salespeople/${person.id}`}
              className="glass-card group flex items-center gap-4 p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-glass-lg"
            >
              <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-brand-gradient text-sm font-bold text-white">
                {initials(person.email)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{person.email}</p>
                <p className="mt-0.5 text-sm font-medium text-brand-400">
                  View profile <span className="transition group-hover:translate-x-0.5">→</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">No salespeople found.</p>
      )}
    </div>
  );
}

export default FinanceSalespeoplePage;
