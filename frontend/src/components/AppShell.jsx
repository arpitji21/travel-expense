import { NavLink, useNavigate } from 'react-router-dom';

function BrandMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 backdrop-blur">
      <svg viewBox="0 0 48 48" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M24 4c-7.2 0-13 5.6-13 12.5C11 26 24 44 24 44s13-18 13-27.5C37 9.6 31.2 4 24 4Z"
          fill="rgba(255,255,255,0.25)"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="17" r="4.5" stroke="white" strokeWidth="2.5" />
      </svg>
    </span>
  );
}

function AppShell({ roleLabel, navItems, user, children }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('accessToken');
    navigate('/');
    window.location.reload();
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-brand-gradient shadow-glass">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div className="leading-tight">
              <p className="text-base font-extrabold tracking-tight text-white">MediRoute</p>
              <p className="text-xs font-medium text-white/70">{roleLabel}</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-pill ${isActive ? 'nav-pill-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mx-1 hidden h-6 w-px bg-white/25 md:block" />

            {user?.email ? (
              <span className="hidden rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 lg:inline">
                {user.email}
              </span>
            ) : null}

            <button
              type="button"
              onClick={handleLogout}
              className="nav-pill border border-white/30 hover:bg-white/20"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl animate-fade-in px-4 py-8">{children}</main>
    </div>
  );
}

export default AppShell;
