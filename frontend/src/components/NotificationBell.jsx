import { useEffect, useRef, useState } from 'react';
import { fetchNotifications, markNotificationsRead } from '../lib/salesApi';
import { formatDate } from '../lib/formatters';

function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  async function load() {
    try {
      const data = await fetchNotifications();
      setItems(data.notifications || []);
      setUnread(data.unread || 0);
    } catch {
      /* ignore transient errors */
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function onClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      try {
        await markNotificationsRead();
      } catch {
        /* ignore */
      }
      setUnread(0);
      setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    }
  }

  return (
    <div ref={ref} className="relative flex-none">
      <button
        type="button"
        onClick={toggle}
        className="nav-pill relative border-white/20"
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-white/10 bg-black/90 p-2 shadow-glass backdrop-blur-xl">
          <p className="px-2 py-1 text-sm font-semibold text-zinc-100">Notifications</p>
          {items.length ? (
            items.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl px-3 py-2 ${item.read ? '' : 'bg-white/5'}`}
              >
                <p className="text-sm text-zinc-200">{item.message}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{formatDate(item.createdAt)}</p>
              </div>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-sm text-zinc-500">No notifications yet.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default NotificationBell;
