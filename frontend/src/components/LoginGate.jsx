import { useEffect, useState } from 'react';
import { fetchMe, login } from '../lib/salesApi';

function LoginGate({ children }) {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('sales@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('accessToken')));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      return;
    }

    fetchMe()
      .then(setUser)
      .catch(() => localStorage.removeItem('accessToken'))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setError('');

    try {
      const data = await login(email, password);
      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
    } catch {
      setError('Sign in failed. Check the seeded credentials.');
    }
  }

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-zinc-50 text-zinc-700">Loading...</div>;
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-50 px-4 text-zinc-950">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-md border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Travel Expense</p>
          <h1 className="mt-2 text-2xl font-bold">Travel Expense Portal</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Seeded users: sales@example.com or finance@example.com
          </p>

          <label className="mt-6 block text-sm font-medium text-zinc-700">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              type="email"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-zinc-700">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              type="password"
            />
          </label>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Sign in
          </button>
        </form>
      </main>
    );
  }

  return typeof children === 'function' ? children(user) : children;
}

export default LoginGate;
