# Deploying LarkPilot

**Architecture:** React frontend on **Vercel**, Flask API + **Postgres** on **Render**.

Both platforms deploy from a Git repo, so first push this project to GitHub (or GitLab/Bitbucket).

```powershell
git add -A
git commit -m "Prepare LarkPilot for deployment"
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
   a web service `larkpilot-api` + a Postgres database `larkpilot-db`. Click **Apply**.
3. Wait for the first deploy to finish (a few minutes). The build installs requirements,
   then `flask db upgrade` + `seed-users` run, then gunicorn starts.
4. Copy your API URL from the service page — it looks like
   `https://larkpilot-api.onrender.com`.
5. Verify it: open `https://larkpilot-api.onrender.com/api/health` → you should see
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
   - **Value:** `https://larkpilot-api.onrender.com/api`  ← your Render URL + `/api`
5. Click **Deploy**. When it finishes, copy your site URL, e.g. `https://larkpilot.vercel.app`.

> `VITE_API_BASE_URL` is baked in at build time. If you change it later, redeploy the frontend.

---

## Part C — Connect them (CORS)

The browser calls the Render API from the Vercel domain, so the API must allow that origin.

1. In **Render** → `larkpilot-api` → **Environment** → add/edit:
   - **Key:** `CORS_ORIGINS`
   - **Value:** your Vercel URL, e.g. `https://larkpilot.vercel.app` (no trailing slash;
     comma-separate multiple domains if needed).
2. Save — Render redeploys automatically.
3. Open your Vercel URL and log in.

**Demo logins** (seeded automatically): `sales@example.com` / `finance@example.com`,
password `password123` — or use **Create account** on the login page.

---

## Part D — Bill storage on Cloudflare R2

So that **bills a salesperson uploads stay visible to the finance department**, store them in
Cloudflare R2 (S3-compatible object storage) instead of Render's ephemeral disk. The backend uses
R2 automatically once these five env vars are set; otherwise it falls back to local disk.

1. In the **Cloudflare dashboard** → **R2** → **Create bucket** (e.g. `larkpilot-bills`). Note your
   **Account ID** (shown on the R2 overview page).
2. Make bills viewable by finance: open the bucket → **Settings** → **Public access**. Either enable
   the **r2.dev** public URL, or connect a **custom domain**. Copy that public base URL
   (e.g. `https://pub-xxxxxxxx.r2.dev`).
3. **R2** → **Manage R2 API Tokens** → **Create API token** with **Object Read & Write** on this
   bucket. Copy the **Access Key ID** and **Secret Access Key** (shown once).
4. In **Render** → `larkpilot-api` → **Environment**, add:
   - `R2_ACCOUNT_ID` — your Cloudflare account ID
   - `R2_ACCESS_KEY_ID` — the token's access key id
   - `R2_SECRET_ACCESS_KEY` — the token's secret
   - `R2_BUCKET` — the bucket name, e.g. `larkpilot-bills`
   - `R2_PUBLIC_BASE_URL` — the public URL from step 2, e.g. `https://pub-xxxxxxxx.r2.dev`
5. Save — Render redeploys. New uploads now land in R2; finance's **View bill** links open the R2
   URL directly. (Bills uploaded *before* this was configured were on ephemeral disk and may be gone
   — re-upload them.)

> **Note:** the r2.dev/custom-domain public URL means anyone with the (random, unguessable) link can
> open a bill. That's the simplest setup. If you need links locked behind login, ask and I can switch
> R2 to a private bucket served through signed URLs.

---

## Things to know

- **Cold starts:** Render's free tier sleeps after ~15 min idle; the first request then takes
  ~30–60s to wake. Paid instances stay warm.
- **Receipt/bill uploads:** Render's free filesystem is **ephemeral** — uploaded bill images are
  lost on every redeploy/restart. All other data (users, demands, expenses, schedule) lives in
  Postgres and persists fine. **Configure Cloudflare R2 (below)** so bills uploaded by salespeople
  stay available for the finance department. If R2 isn't configured, the app silently falls back to
  local disk (fine for local dev, lossy on Render free tier).
- **Preview deployments:** each Vercel preview has a unique URL. To use the API from previews,
  add those origins to `CORS_ORIGINS` too, or test against the production domain.
- **Local development** is unchanged — see `README.md` (SQLite via `DATABASE_URL`, or MySQL).
