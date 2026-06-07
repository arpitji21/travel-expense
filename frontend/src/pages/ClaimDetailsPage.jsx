import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { buildAssetUrl } from '../lib/apiClient';
import { formatCurrency, formatDate } from '../lib/formatters';
import {
  addExpense,
  addTravelLeg,
  fetchClaim,
  submitClaim,
  uploadReceipt
} from '../lib/salesApi';

const today = new Date().toISOString().slice(0, 10);

function ClaimDetailsPage() {
  const { claimId } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [travelLeg, setTravelLeg] = useState({
    origin: '',
    destination: '',
    transportMode: 'Flight',
    departureDate: today,
    returnDate: ''
  });
  const [expense, setExpense] = useState({
    category: 'Airfare',
    description: '',
    amount: '',
    currency: 'USD',
    expenseDate: today,
    receipt: null
  });

  const loadClaim = useCallback(async () => {
    setLoading(true);
    const data = await fetchClaim(claimId);
    setClaim(data);
    setExpense((current) => ({ ...current, currency: data.currency || 'USD' }));
    setLoading(false);
  }, [claimId]);

  useEffect(() => {
    loadClaim();
  }, [loadClaim]);

  function updateTravelLeg(field, value) {
    setTravelLeg((current) => ({ ...current, [field]: value }));
  }

  function updateExpense(field, value) {
    setExpense((current) => ({ ...current, [field]: value }));
  }

  async function handleAddTravelLeg(event) {
    event.preventDefault();
    setMessage('');

    try {
      await addTravelLeg({ claimId: Number(claimId), ...travelLeg });
      setTravelLeg({
        origin: '',
        destination: '',
        transportMode: 'Flight',
        departureDate: today,
        returnDate: ''
      });
      await loadClaim();
      setMessage('Travel leg added.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to add travel leg.');
    }
  }

  async function handleAddExpense(event) {
    event.preventDefault();
    setMessage('');

    try {
      const data = await addExpense({
        claimId: Number(claimId),
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        currency: expense.currency,
        expenseDate: expense.expenseDate
      });

      if (expense.receipt) {
        await uploadReceipt(data.expense.id, expense.receipt);
      }

      setExpense({
        category: 'Airfare',
        description: '',
        amount: '',
        currency: claim.currency,
        expenseDate: today,
        receipt: null
      });
      event.target.reset();
      await loadClaim();
      setMessage('Expense added.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to add expense.');
    }
  }

  async function handleSubmitClaim() {
    setMessage('');

    try {
      const submitted = await submitClaim(claimId);
      setClaim(submitted);
      setMessage('Claim submitted.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to submit claim.');
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading claim...</p>;
  }

  if (!claim) {
    return <p className="text-sm text-zinc-600">Claim not found.</p>;
  }

  const isDraft = claim.status === 'draft';

  return (
    <div className="space-y-6">
      <Link to="/claims" className="text-sm font-semibold text-teal-700 hover:text-teal-900">
        Back to claims
      </Link>

      <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Claim Details</p>
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
        {isDraft ? (
          <button
            type="button"
            onClick={handleSubmitClaim}
            className="mt-5 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Submit Claim
          </button>
        ) : null}
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

          {isDraft ? (
            <form onSubmit={handleAddTravelLeg} className="mt-5 grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={travelLeg.origin}
                  onChange={(event) => updateTravelLeg('origin', event.target.value)}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder="Origin"
                />
                <input
                  value={travelLeg.destination}
                  onChange={(event) => updateTravelLeg('destination', event.target.value)}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder="Destination"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <select
                  value={travelLeg.transportMode}
                  onChange={(event) => updateTravelLeg('transportMode', event.target.value)}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  <option>Flight</option>
                  <option>Train</option>
                  <option>Car</option>
                  <option>Bus</option>
                </select>
                <input
                  value={travelLeg.departureDate}
                  onChange={(event) => updateTravelLeg('departureDate', event.target.value)}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  type="date"
                />
                <input
                  value={travelLeg.returnDate}
                  onChange={(event) => updateTravelLeg('returnDate', event.target.value)}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  type="date"
                />
              </div>
              <button
                type="submit"
                className="w-fit rounded-md border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
              >
                Add Travel Leg
              </button>
            </form>
          ) : null}
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
                        className="font-semibold text-teal-700 hover:text-teal-900"
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

          {isDraft ? (
            <form onSubmit={handleAddExpense} className="mt-5 grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={expense.category}
                  onChange={(event) => updateExpense('category', event.target.value)}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  <option>Airfare</option>
                  <option>Lodging</option>
                  <option>Meals</option>
                  <option>Ground Transport</option>
                  <option>Other</option>
                </select>
                <input
                  value={expense.amount}
                  onChange={(event) => updateExpense('amount', event.target.value)}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder="Amount"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={expense.currency}
                  maxLength={3}
                  onChange={(event) => updateExpense('currency', event.target.value.toUpperCase())}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm uppercase outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
                <input
                  value={expense.expenseDate}
                  onChange={(event) => updateExpense('expenseDate', event.target.value)}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  type="date"
                />
              </div>
              <textarea
                value={expense.description}
                onChange={(event) => updateExpense('description', event.target.value)}
                className="min-h-20 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="Description"
              />
              <input
                onChange={(event) => updateExpense('receipt', event.target.files?.[0] || null)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
              />
              <button
                type="submit"
                className="w-fit rounded-md border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
              >
                Add Expense
              </button>
            </form>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default ClaimDetailsPage;
