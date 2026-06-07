import { useEffect, useMemo, useState } from 'react';
import FinanceClaimList from '../components/FinanceClaimList';
import { approveClaim, fetchClaims, reimburseClaim, rejectClaim } from '../lib/salesApi';
import { formatCurrency } from '../lib/formatters';

function FinanceDashboardPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadClaims() {
    setLoading(true);
    const data = await fetchClaims();
    setClaims(data);
    setLoading(false);
  }

  useEffect(() => {
    loadClaims();
  }, []);

  const buckets = useMemo(
    () => ({
      submitted: claims.filter((claim) => claim.status === 'submitted'),
      approved: claims.filter((claim) => claim.status === 'approved'),
      reimbursed: claims.filter((claim) => claim.status === 'reimbursed')
    }),
    [claims]
  );

  const approvedAmount = buckets.approved.reduce((sum, claim) => sum + Number(claim.totalAmount || 0), 0);
  const reimbursedAmount = buckets.reimbursed.reduce((sum, claim) => sum + Number(claim.totalAmount || 0), 0);

  async function runAction(action, claimId, successMessage) {
    setMessage('');

    try {
      await action(claimId);
      await loadClaims();
      setMessage(successMessage);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to update claim.');
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading finance dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Dashboard</p>
        <h2 className="text-3xl font-bold">Finance claim queue</h2>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">Submitted Claims</p>
          <p className="mt-2 text-3xl font-bold">{buckets.submitted.length}</p>
        </div>
        <div className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">Approved Claims</p>
          <p className="mt-2 text-3xl font-bold">{buckets.approved.length}</p>
          <p className="mt-1 text-sm text-zinc-600">{formatCurrency(approvedAmount)}</p>
        </div>
        <div className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">Reimbursed Claims</p>
          <p className="mt-2 text-3xl font-bold">{buckets.reimbursed.length}</p>
          <p className="mt-1 text-sm text-zinc-600">{formatCurrency(reimbursedAmount)}</p>
        </div>
      </section>

      {message ? <p className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-700">{message}</p> : null}

      <FinanceClaimList
        title="Submitted Claims"
        claims={buckets.submitted}
        emptyText="No submitted claims are waiting for review."
        onApprove={(claimId) => runAction(approveClaim, claimId, 'Claim approved.')}
        onReject={(claimId) => runAction(rejectClaim, claimId, 'Claim rejected.')}
        onReimburse={(claimId) => runAction(reimburseClaim, claimId, 'Claim marked reimbursed.')}
      />

      <FinanceClaimList
        title="Approved Claims"
        claims={buckets.approved}
        emptyText="No approved claims are waiting for reimbursement."
        onApprove={(claimId) => runAction(approveClaim, claimId, 'Claim approved.')}
        onReject={(claimId) => runAction(rejectClaim, claimId, 'Claim rejected.')}
        onReimburse={(claimId) => runAction(reimburseClaim, claimId, 'Claim marked reimbursed.')}
      />

      <FinanceClaimList
        title="Reimbursed Claims"
        claims={buckets.reimbursed}
        emptyText="No claims have been reimbursed yet."
        onApprove={(claimId) => runAction(approveClaim, claimId, 'Claim approved.')}
        onReject={(claimId) => runAction(rejectClaim, claimId, 'Claim rejected.')}
        onReimburse={(claimId) => runAction(reimburseClaim, claimId, 'Claim marked reimbursed.')}
      />
    </div>
  );
}

export default FinanceDashboardPage;
