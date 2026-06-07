import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ClaimTable from '../components/ClaimTable';
import { fetchClaims } from '../lib/salesApi';
import { formatCurrency } from '../lib/formatters';

function DashboardPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims()
      .then(setClaims)
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const draftCount = claims.filter((claim) => claim.status === 'draft').length;
    const submittedCount = claims.filter((claim) => claim.status === 'submitted').length;
    const totalAmount = claims.reduce((sum, claim) => sum + Number(claim.totalAmount || 0), 0);

    return { draftCount, submittedCount, totalAmount };
  }, [claims]);

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Dashboard</p>
          <h2 className="text-3xl font-bold">Sales travel claims</h2>
        </div>
        <Link
          to="/claims/new"
          className="w-fit rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Create Claim
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">Draft claims</p>
          <p className="mt-2 text-3xl font-bold">{metrics.draftCount}</p>
        </div>
        <div className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">Submitted claims</p>
          <p className="mt-2 text-3xl font-bold">{metrics.submittedCount}</p>
        </div>
        <div className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">Total requested</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(metrics.totalAmount)}</p>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent claims</h3>
          <Link to="/claims" className="text-sm font-semibold text-teal-700 hover:text-teal-900">
            View all
          </Link>
        </div>
        <ClaimTable claims={claims.slice(0, 5)} />
      </section>
    </div>
  );
}

export default DashboardPage;
