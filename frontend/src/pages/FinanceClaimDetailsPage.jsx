import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { buildAssetUrl } from '../lib/apiClient';
import { formatCurrency, formatDate } from '../lib/formatters';
import { approveClaim, fetchClaim, reimburseClaim, rejectClaim } from '../lib/salesApi';

function FinanceClaimDetailsPage() {
  const { claimId } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadClaim = useCallback(async () => {
    setLoading(true);
    const data = await fetchClaim(claimId);
    setClaim(data);
    setLoading(false);
  }, [claimId]);

  useEffect(() => {
    loadClaim();
  }, [loadClaim]);

  async function runAction(action, successMessage) {
    setMessage('');

    try {
      const updated = await action(claimId);
      setClaim(updated);
      setMessage(successMessage);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to update claim.');
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading claim...</p>;
  }

  if (!claim) {
    return <p className="text-sm text-zinc-600">Claim not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">
        Back to dashboard
      </Link>

      <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Finance Review</p>
            <h2 className="mt-1 text-3xl font-bold">{claim.title}</h2>
            <p className="mt-2 max-w-3xl text-sm text-zinc-600">{claim.purpose || 'No purpose added.'}</p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <StatusBadge status={claim.status} />
            <p className="text-2xl font-bold">{formatCurrency(claim.totalAmount, claim.currency)}</p>
            <p className="text-sm text-zinc-600">Submitted {formatDate(claim.submittedAt)}</p>
          </div>
        </div>

        {message ? <p className="mt-4 rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-700">{message}</p> : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {claim.status === 'submitted' ? (
            <>
              <button
                type="button"
                onClick={() => runAction(approveClaim, 'Claim approved.')}
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => runAction(rejectClaim, 'Claim rejected.')}
                className="rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
              >
                Reject
              </button>
            </>
          ) : null}
          {claim.status === 'approved' ? (
            <button
              type="button"
              onClick={() => runAction(reimburseClaim, 'Claim marked reimbursed.')}
              className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800"
            >
              Mark Reimbursed
            </button>
          ) : null}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Travel legs</h3>
          <div className="mt-4 space-y-3">
            {claim.travelLegs.length ? (
              claim.travelLegs.map((leg) => (
                <div key={leg.id} className="rounded-md border border-zinc-200 p-3">
                  <p className="font-semibold">
                    {leg.origin} to {leg.destination}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {leg.transportMode} - {formatDate(leg.departureDate)} to {formatDate(leg.returnDate)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-600">No travel legs added.</p>
            )}
          </div>
        </section>

        <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Expenses</h3>
          <div className="mt-4 space-y-3">
            {claim.expenses.length ? (
              claim.expenses.map((item) => (
                <div key={item.id} className="rounded-md border border-zinc-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.category}</p>
                      <p className="mt-1 text-sm text-zinc-600">{item.description || 'No description'}</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.amount, item.currency)}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
                    <span>{formatDate(item.expenseDate)}</span>
                    {item.receiptUrl ? (
                      <a
                        href={buildAssetUrl(item.receiptUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-indigo-700 hover:text-indigo-900"
                      >
                        Receipt
                      </a>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-600">No expenses added.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default FinanceClaimDetailsPage;
