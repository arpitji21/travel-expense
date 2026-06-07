// Reusable loading UI: a full-screen branded preloader and a small inline spinner.

export function Spinner({ className = 'h-5 w-5', tone = 'brand' }) {
  const ring =
    tone === 'white'
      ? 'border-white/40 border-t-white'
      : 'border-brand-200 border-t-brand-600';
  return <span className={`inline-block animate-spin-slow rounded-full border-2 ${ring} ${className}`} />;
}

export function PageLoading({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm font-medium text-zinc-500">
      <Spinner />
      {label}
    </div>
  );
}

function MediRouteMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden="true">
      <path
        d="M24 4c-7.2 0-13 5.6-13 12.5C11 26 24 44 24 44s13-18 13-27.5C37 9.6 31.2 4 24 4Z"
        fill="rgba(255,255,255,0.18)"
        stroke="white"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M24 13v9M19.5 17.5h9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Preloader() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-brand-gradient">
      <div className="flex flex-col items-center gap-6 text-white">
        <div className="relative grid place-items-center">
          <span className="absolute h-24 w-24 animate-spin-slow rounded-full border-2 border-white/20 border-t-white/80" />
          <span className="animate-float">
            <MediRouteMark />
          </span>
        </div>
        <div className="text-center">
          <p className="text-2xl font-extrabold tracking-tight">MediRoute</p>
          <p className="mt-1 text-sm text-white/70">Field Sales, Demands &amp; Expenses</p>
        </div>
        <div className="mt-1 flex gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-white/80 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-white/80 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-white/80" />
        </div>
      </div>
    </div>
  );
}

export default Preloader;
