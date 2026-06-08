import { useEffect, useState } from 'react';
import Preloader, { Spinner } from './Loader';
import LarkWordmark from './LarkWordmark';
import { fetchMe, login, register } from '../lib/salesApi';

const DEPARTMENTS = {
  sales: {
    label: 'Sales Department',
    email: 'sales@example.com',
    blurb: 'Record hospital demands, plan your daily route and claim expenses.',
    icon: '🩺'
  },
  finance: {
    label: 'Finance Department',
    email: 'finance@example.com',
    blurb: 'Review demands and expenses, and approve reimbursements.',
    icon: '📊'
  }
};

function LoginGate({ children }) {
  const [user, setUser] = useState(null);
  const [department, setDepartment] = useState(null);
  const [mode, setMode] = useState('signin'); // 'signin' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [confirm, setConfirm] = useState('');
  const [authChecking, setAuthChecking] = useState(Boolean(localStorage.getItem('accessToken')));
  const [booting, setBooting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Branded splash on first load (also covers the token auth-check).
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      return;
    }

    fetchMe()
      .then(setUser)
      .catch(() => localStorage.removeItem('accessToken'))
      .finally(() => setAuthChecking(false));
  }, []);

  function chooseDepartment(key) {
    setDepartment(key);
    setMode('signin');
    setEmail(DEPARTMENTS[key].email);
    setPassword('password123');
    setConfirm('');
    setError('');
  }

  function backToDepartments() {
    setDepartment(null);
    setError('');
  }

  function switchMode(next) {
    setMode(next);
    setError('');
    if (next === 'register') {
      setEmail('');
      setPassword('');
      setConfirm('');
    } else {
      setEmail(DEPARTMENTS[department].email);
      setPassword('password123');
    }
  }

  function finishAuth(data) {
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
  }

  async function handleSignIn(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await login(email, password);

      if (data.user.role !== department) {
        setError(
          `This is a ${DEPARTMENTS[data.user.role]?.label || data.user.role} account. ` +
            'Please go back and choose the matching department.'
        );
        return;
      }

      finishAuth(data);
    } catch {
      setError('Sign in failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await register(email, password, department);
      finishAuth(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the account.');
    } finally {
      setSubmitting(false);
    }
  }

  if (booting || authChecking) {
    return <Preloader />;
  }

  if (user) {
    return typeof children === 'function' ? children(user) : children;
  }

  // Step 1: choose a department.
  if (!department) {
    return (
      <main className="grid min-h-screen place-items-center px-4 py-10">
        <div className="w-full max-w-3xl animate-fade-in text-center">
          <LarkWordmark className="mx-auto mb-6 h-12 w-auto text-zinc-100" />
          <h1 className="text-3xl font-extrabold tracking-tight">Field Sales, Demands &amp; Expenses</h1>
          <p className="mt-2 text-zinc-400">Choose your department to continue.</p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {Object.entries(DEPARTMENTS).map(([key, dept]) => (
              <button
                key={key}
                type="button"
                onClick={() => chooseDepartment(key)}
                className="glass-card group p-7 text-left transition duration-300 hover:-translate-y-1 hover:shadow-glass-lg"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-2xl">
                  {dept.icon}
                </div>
                <p className="mt-4 text-lg font-bold text-white">{dept.label}</p>
                <p className="mt-1 text-sm text-zinc-400">{dept.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold gradient-text">
                  Continue
                  <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Step 2: sign in to / create an account in the chosen department.
  const dept = DEPARTMENTS[department];
  const isRegister = mode === 'register';

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <form
        onSubmit={isRegister ? handleRegister : handleSignIn}
        className="glass-card w-full max-w-sm animate-fade-in p-7"
      >
        <button
          type="button"
          onClick={backToDepartments}
          className="text-sm font-semibold text-zinc-400 transition hover:text-zinc-100"
        >
          ← Change department
        </button>

        <LarkWordmark className="mt-4 h-7 w-auto text-zinc-100" />
        <p className="mt-5 text-sm font-semibold uppercase tracking-wide gradient-text">{dept.label}</p>
        <h1 className="mt-1 text-2xl font-bold">
          {isRegister ? 'Create your account' : 'Sign in'}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {isRegister
            ? `You'll be added to the ${dept.label}.`
            : 'Demo password for both accounts: password123'}
        </p>

        <label className="mt-6 block">
          <span className="field-label">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input"
            type="email"
            autoComplete="username"
            placeholder={isRegister ? 'you@company.com' : ''}
          />
        </label>

        <label className="mt-4 block">
          <span className="field-label">Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            placeholder={isRegister ? 'At least 6 characters' : ''}
          />
        </label>

        {isRegister ? (
          <label className="mt-4 block">
            <span className="field-label">Confirm password</span>
            <input
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
            />
          </label>
        ) : null}

        {error ? <p className="mt-4 text-sm font-medium text-rose-400">{error}</p> : null}

        <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">
          {submitting ? <Spinner tone="white" className="h-4 w-4" /> : null}
          {submitting
            ? isRegister
              ? 'Creating account...'
              : 'Signing in...'
            : isRegister
              ? 'Create account'
              : 'Sign in'}
        </button>

        <p className="mt-5 text-center text-sm text-zinc-400">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="font-semibold text-brand-400 hover:text-brand-300"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="font-semibold text-brand-400 hover:text-brand-300"
              >
                Create a {dept.label.replace(' Department', '')} account
              </button>
            </>
          )}
        </p>
      </form>
    </main>
  );
}

export default LoginGate;
