import { formatDate } from '../lib/formatters';

function TodayRoute({ route, today }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white shadow-glass">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-bold">Today&apos;s route</h3>
          <span className="text-sm text-white/80">{formatDate(today)}</span>
        </div>

        {route.length ? (
          <>
            <p className="mt-1 text-sm text-white/80">
              {route.length} {route.length === 1 ? 'hospital' : 'hospitals'} with open demands to visit.
            </p>
            <ol className="mt-4 space-y-3">
              {route.map((stop, index) => (
                <li
                  key={`${stop.hospitalName}-${index}`}
                  className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full bg-white text-xs font-bold text-brand-700">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold">{stop.hospitalName}</p>
                      <p className="text-sm text-white/75">{stop.hospitalAddress || 'No address on file'}</p>
                      <ul className="mt-2 space-y-1 text-sm text-white/90">
                        {stop.items.map((item, itemIndex) => (
                          <li key={itemIndex}>
                            {item.product} &times; {item.quantity}
                            {item.note ? <span className="text-white/60"> — {item.note}</span> : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="mt-2 text-sm text-white/80">
            No open demands — nothing scheduled to visit today. Add a demand to plan a visit.
          </p>
        )}
      </div>
    </section>
  );
}

export default TodayRoute;
