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
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {

      console.log("Loading salesperson...");

      const user = await fetchUser(userId);

      console.log("User Loaded", user);

      setPerson(user);

    } catch (err) {

      console.error("User API Failed", err);

      setMessage(
        err.response?.data?.message ||
        "Unable to load salesperson."
      );

      setLoading(false);

      return;
    }

    try {

      console.log("Loading Schedule...");

      const data = await fetchSchedule({ userId });

      console.log(data);

      setSchedule(Array.isArray(data) ? data : []);

    } catch (err) {

      console.error("Schedule API Failed", err);

    }

    try {

      console.log("Loading Expenses...");

      const data = await fetchExpenses(userId);

      console.log(data);

      setExpenses(Array.isArray(data) ? data : []);

    } catch (err) {

      console.error("Expense API Failed", err);

    }

    try {

      console.log("Loading Demands...");

      const data = await fetchDemands(userId);

      console.log(data);

      setDemands(Array.isArray(data) ? data : []);

    } catch (err) {

      console.error("Demand API Failed", err);

    }

    setLoading(false);

  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(action, expenseId, successMessage) {

    try {

      await action(expenseId);

      await load();

      setMessage(successMessage);

    } catch (err) {

      setMessage(
        err.response?.data?.message ||
        "Unable to update expense."
      );

    }

  }

  if (loading) {
    return <PageLoading label="Loading profile..." />;
  }

  if (!person) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold text-red-500">
          Salesperson not found
        </h2>

        {message && (
          <p className="mt-2 text-gray-400">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <Link
        to="/salespeople"
        className="text-sm font-semibold text-brand-400 hover:text-brand-300"
      >
        ← Back to salespeople
      </Link>

      <div className="glass-card flex items-center gap-4 p-6">

        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white font-bold">
          {(person.email || "?").slice(0, 2).toUpperCase()}
        </span>

        <div>

          <p className="text-sm uppercase tracking-wide text-brand-400">
            Salesperson Profile
          </p>

          <h2 className="text-2xl font-bold">
            {person.email}
          </h2>

        </div>

      </div>

      {message && (
        <div className="rounded-lg bg-red-500/10 border border-red-500 p-3">
          {message}
        </div>
      )}

      <section className="glass-card p-6">

        <h3 className="section-title">
          Daily Schedule
        </h3>

        <div className="mt-4">

          <ScheduleList
            entries={schedule}
            emptyText="No schedule found."
          />

        </div>

      </section>

      <section className="glass-card p-6">

        <h3 className="section-title">
          Reimbursement Bills
        </h3>

        <div className="space-y-4 mt-4">

          {expenses.length === 0 ? (

            <p>No expenses found.</p>

          ) : (

            expenses.map((expense) => (

              <div
                key={expense.id}
                className="rounded-xl border border-white/10 p-4"
              >

                <div className="flex flex-wrap items-center gap-2">

                  <strong>{expense.category}</strong>

                  <StatusBadge status={expense.status} />

                </div>

                <p>{expense.description || "No description"}</p>

                <p>

                  {formatCurrency(
                    expense.amount,
                    expense.currency
                  )}

                </p>

                <p>

                  {formatDate(expense.expenseDate)}

                </p>

                {expense.receiptUrl && (

                  <a
                    href={buildAssetUrl(expense.receiptUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Bill
                  </a>

                )}

                <div className="flex gap-2 mt-3">

                  {expense.status === "submitted" && (
                    <>
                      <button
                        className="btn-success btn-sm"
                        onClick={() =>
                          runAction(
                            approveExpense,
                            expense.id,
                            "Expense Approved"
                          )
                        }
                      >
                        Approve
                      </button>

                      <button
                        className="btn-danger btn-sm"
                        onClick={() =>
                          runAction(
                            rejectExpense,
                            expense.id,
                            "Expense Rejected"
                          )
                        }
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {expense.status === "approved" && (
                    <button
                      className="btn-primary btn-sm"
                      onClick={() =>
                        runAction(
                          reimburseExpense,
                          expense.id,
                          "Expense Reimbursed"
                        )
                      }
                    >
                      Mark Reimbursed
                    </button>
                  )}

                </div>

              </div>

            ))

          )}

        </div>

      </section>

      <section className="glass-card p-6">

        <h3 className="section-title">
          Hospital Demands
        </h3>

        <div className="space-y-3 mt-4">

          {demands.length === 0 ? (

            <p>No demands found.</p>

          ) : (

            demands.map((demand) => (

              <div
                key={demand.id}
                className="rounded-xl border border-white/10 p-4"
              >

                <div className="flex items-center gap-2">

                  <strong>
                    {demand.hospitalName}
                  </strong>

                  <StatusBadge status={demand.status} />

                </div>

                <p>{demand.hospitalAddress}</p>

                <p>
                  {demand.product} × {demand.quantity}
                </p>

                <small>
                  {formatDate(demand.createdAt)}
                </small>

              </div>

            ))

          )}

        </div>

      </section>

    </div>
  );
}

export default FinanceSalespersonProfilePage;