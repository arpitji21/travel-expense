import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/formatters';
import StatusBadge from './StatusBadge';

function ClaimTable({ claims }) {
  if (!claims.length) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-600">
        No claims found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-zinc-100 text-xs uppercase text-zinc-600">
          <tr>
            <th className="px-4 py-3">Claim</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr key={claim.id} className="border-t border-zinc-200">
              <td className="px-4 py-3">
                <Link className="font-semibold text-teal-700 hover:text-teal-900" to={`/claims/${claim.id}`}>
                  {claim.title}
                </Link>
                <p className="mt-1 text-xs text-zinc-500">{claim.purpose || 'No purpose added'}</p>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={claim.status} />
              </td>
              <td className="px-4 py-3 font-medium">{formatCurrency(claim.totalAmount, claim.currency)}</td>
              <td className="px-4 py-3 text-zinc-600">{formatDate(claim.createdAt)}</td>
              <td className="px-4 py-3 text-zinc-600">{formatDate(claim.submittedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClaimTable;
