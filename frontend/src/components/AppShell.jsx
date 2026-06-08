import { NavLink, useNavigate } from 'react-router-dom';
import LarkWordmark from './LarkWordmark';

function AppShell({ roleLabel, navItems, user, children }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('accessToken');
    navigate('/');
    window.location.reload();
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 shadow-glass backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <LarkWordmark className="h-6 w-auto text-zinc-100" />
            <span className="hidden h-6 w-px bg-white/15 sm:block" />
            <p className="hidden text-xs font-medium text-zinc-400 sm:block">{roleLabel}</p>
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
