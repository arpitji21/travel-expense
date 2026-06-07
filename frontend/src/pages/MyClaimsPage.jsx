import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ClaimTable from '../components/ClaimTable';
import { fetchClaims } from '../lib/salesApi';

function MyClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims()
      .then(setClaims)
      .finally(() => setLoading(false));
  }, []);

  const filteredClaims =
    status === 'all' ? claims : claims.filter((claim) => claim.status === status);

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading claims...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">My Claims</p>
          <h2 className="text-3xl font-bold">Submitted and draft claims</h2>
        </div>
        <Link
          to="/claims/new"
          className="w-fit rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Create Claim
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'draft', 'submitted', 'approved', 'rejected', 'reimbursed'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStatus(item)}
            className={`rounded-md px-3 py-2 text-sm font-semibold capitalize ${
              status === item
                ? 'bg-teal-700 text-white'
                : 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <ClaimTable claims={filteredClaims} />
    </div>
  );
}

export default MyClaimsPage;
