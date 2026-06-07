# Deploying MediRoute

**Architecture:** React frontend on **Vercel**, Flask API + **Postgres** on **Render**.

Both platforms deploy from a Git repo, so first push this project to GitHub (or GitLab/Bitbucket).

```powershell
git add -A
git commit -m "Prepare MediRoute for deployment"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

---

## Part A — Backend + database on Render

This repo ships a `render.yaml` blueprint that creates the API service **and** a free
Postgres database, wires them together, runs migrations, and seeds the demo users.

1. Go to <https://render.com> → sign in → **New +** → **Blueprint**.
2. Connect your GitHub repo and select it. Render reads `render.yaml` and shows a plan:
   a web service `mediroute-api` + a Postgres database `mediroute-db`. Click **Apply**.
3. Wait for the first deploy to finish (a few minutes). The build installs requirements,
   then `flask db upgrade` + `seed-users` run, then gunicorn starts.
4. Copy your API URL from the service page — it looks like
   `https://mediroute-api.onrender.com`.
5. Verify it: open `https://mediroute-api.onrender.com/api/health` → you should see
   `{"status":"ok"}`.

> Leave `CORS_ORIGINS` empty for now — you'll set it in Part C once you have the Vercel URL.

---

## Part B — Frontend on Vercel

1. Go to <https://vercel.com> → **Add New… → Project** → import the same repo.
2. **Root Directory:** click **Edit** and set it to **`frontend`**. (Important — the React app
   lives in that subfolder.)
3. Framework Preset should auto-detect **Vite** (build `vite build`, output `dist`). Leave as-is.
4. Expand **Environment Variables** and add:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://mediroute-api.onrender.com/api`  ← your Render URL + `/api`
5. Click **Deploy**. When it finishes, copy your site URL, e.g. `https://mediroute.vercel.app`.

> `VITE_API_BASE_URL` is baked in at build time. If you change it later, redeploy the frontend.

---

## Part C — Connect them (CORS)

The browser calls the Render API from the Vercel domain, so the API must allow that origin.

1. In **Render** → `mediroute-api` → **Environment** → add/edit:
   - **Key:** `CORS_ORIGINS`
   - **Value:** your Vercel URL, e.g. `https://mediroute.vercel.app` (no trailing slash;
     comma-separate multiple domains if needed).
2. Save — Render redeploys automatically.
3. Open your Vercel URL and log in.

**Demo logins** (seeded automatically): `sales@example.com` / `finance@example.com`,
password `password123` — or use **Create account** on the login page.

---

## Things to know

- **Cold starts:** Render's free tier sleeps after ~15 min idle; the first request then takes
  ~30–60s to wake. Paid instances stay warm.
- **Receipt/bill uploads:** Render's free filesystem is **ephemeral** — uploaded bill images are
  lost on every redeploy/restart. All other data (users, demands, expenses, schedule) lives in
  Postgres and persists fine. To keep uploaded files permanently, either:
  - add a Render **Persistent Disk** (paid) and set `UPLOAD_FOLDER` to its mount path
    (e.g. `/var/data/receipts`), or
  - switch uploads to object storage (S3 / Cloudinary). Ask and I can wire this up.
- **Preview deployments:** each Vercel preview has a unique URL. To use the API from previews,
  add those origins to `CORS_ORIGINS` too, or test against the production domain.
- **Local development** is unchanged — see `README.md` (SQLite via `DATABASE_URL`, or MySQL).
