# MediRoute

**MediRoute** — a field-sales companion for hospital demands, daily routes/schedules, and expense reimbursements. Full-stack app with two roles — **salesperson** and **finance**.

- A **salesperson** records hospital demands (hospital, product, quantity) and raises
  expenses by uploading a photo/scan of a bill (e.g. a metro ticket) with amount and date.
- A **finance** user logs in and reviews everything in two tabs: a **Demands** list and an
  **Expenses** list, each filterable by a particular salesperson, and approves/reimburses expenses.

Stack:

- React + Vite + Tailwind frontend
- Flask backend
- MySQL connection through SQLAlchemy
- JWT authentication with sales/finance roles
- SQLAlchemy models and migration for users, demands, and expenses
- Seed users for sales and finance roles
- Environment variable templates
- Docker Compose orchestration

## Folder Structure

```text
.
|-- backend/
|   |-- app/
|   |   |-- models/
|   |   |   |-- demand.py
|   |   |   |-- expense.py
|   |   |   |-- schedule_entry.py
|   |   |   `-- user.py
|   |   |-- routes/
|   |   |   |-- auth.py
|   |   |   |-- demands.py
|   |   |   |-- expenses.py
|   |   |   |-- health.py
|   |   |   |-- schedule.py
|   |   |   `-- users.py
|   |   |-- __init__.py
|   |   |-- config.py
|   |   `-- extensions.py
|   |-- .env.example
|   |-- Dockerfile
|   |-- migrations/
|   |-- requirements.txt
|   `-- run.py
|-- frontend/
|   |-- src/
|   |   |-- lib/
|   |   |   `-- apiClient.js
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- styles.css
|   |-- .env.example
|   |-- Dockerfile
|   |-- index.html
|   |-- package.json
|   |-- postcss.config.js
|   |-- tailwind.config.js
|   `-- vite.config.js
|-- docker-compose.yml
`-- README.md
```

## Environment Setup

Copy the example files before running locally without Docker:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update secrets before using this outside local development.

## Run With Docker

```bash
docker compose up --build
```

Run migrations and seed users after MySQL is healthy:

```bash
docker compose exec backend flask --app run.py db upgrade
docker compose exec backend flask --app run.py seed-users
```

Apps:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/api/health
- MySQL: localhost:3306

## Run Locally

Start MySQL first, then configure `backend/.env`.

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app run.py db upgrade
flask --app run.py seed-users
flask --app run.py run --host 0.0.0.0 --port 5000
```

On Windows PowerShell, activate the virtual environment with:

```powershell
.\.venv\Scripts\Activate.ps1
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Seed Users

```text
sales@example.com / password123
finance@example.com / password123
```

## API Endpoints

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Users:

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

Demands:

- `GET /api/demands` (finance can pass `?userId=` to filter by salesperson)
- `GET /api/demands/route` — today's route: hospitals with open demands grouped into one stop each (finance can pass `?userId=`)
- `POST /api/demands`
- `GET /api/demands/:id`
- `PUT /api/demands/:id`
- `DELETE /api/demands/:id`

Schedule (daily visits):

- `GET /api/schedule` (finance can pass `?userId=` to view a salesperson; optional `?date=`)
- `POST /api/schedule`
- `GET /api/schedule/:id`
- `PUT /api/schedule/:id` (edit, or toggle `done`)
- `DELETE /api/schedule/:id`

Expenses:

- `GET /api/expenses` (finance can pass `?userId=` to filter by salesperson)
- `POST /api/expenses`
- `GET /api/expenses/:id`
- `PUT /api/expenses/:id`
- `POST /api/expenses/:id/receipt` (multipart upload of the bill image/PDF)
- `POST /api/expenses/:id/approve`
- `POST /api/expenses/:id/reject`
- `POST /api/expenses/:id/reimburse`
- `DELETE /api/expenses/:id`

All non-auth endpoints require a JWT bearer token. Finance users can read all demands and
expenses; sales users can only see their own.

## Salesperson Module

Salesperson pages:

- Dashboard: **Today's route** banner (hospitals with open demands), **Today's schedule**, plus demand/expense counts and recent activity
- Schedule: keep a daily schedule of visits (date, place, time, note) and tick each one off as done
- Demands / Add Demand: record a hospital demand (hospital, address, product, quantity, note)
- Expenses / Add Expense: upload a bill image (travel/metro and others) with amount and date, then track its status

## Finance Module

Finance pages (tabs):

- Demands: every recorded hospital demand, filterable by salesperson
- Expenses: every raised expense with its bill image, filterable by salesperson
- Salespeople: a profile per salesperson combining their daily schedule, reimbursement bills, and demands; expenses can be approved/reimbursed from here too

Finance users can, per expense:

- Approve a submitted expense
- Reject a submitted expense
- Mark an approved expense reimbursed
