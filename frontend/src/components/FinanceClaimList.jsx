import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/formatters';
import StatusBadge from './StatusBadge';

function FinanceClaimList({ title, claims, emptyText, onApprove, onReject, onReimburse }) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-5 py-4">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      {claims.length ? (
        <div className="divide-y divide-zinc-200">
          {claims.map((claim) => (
            <div key={claim.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link className="font-semibold text-indigo-700 hover:text-indigo-900" to={`/claims/${claim.id}`}>
                    {claim.title}
                  </Link>
                  <StatusBadge status={claim.status} />
                </div>
                <p className="mt-1 text-sm text-zinc-600">{claim.purpose || 'No purpose added'}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-600">
                  <span>{formatCurrency(claim.totalAmount, claim.currency)}</span>
                  <span>Submitted {formatDate(claim.submittedAt)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {claim.status === 'submitted' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onApprove(claim.id)}
                      className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(claim.id)}
                      className="rounded-md border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      Reject
                    </button>
                  </>
                ) : null}
                {claim.status === 'approved' ? (
                  <button
                    type="button"
                    onClick={() => onReimburse(claim.id)}
                    className="rounded-md bg-indigo-700 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-800"
                  >
                    Mark Reimbursed
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 py-8 text-sm text-zinc-600">{emptyText}</div>
      )}
    </section>
  );
}

export default FinanceClaimList;
