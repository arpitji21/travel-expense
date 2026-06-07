# Travel Expense Reimbursement System

Full-stack starter scaffold for a Travel Expense Reimbursement System.

This repository includes the backend foundation and first API layer:

- React + Vite + Tailwind frontend
- Flask backend
- MySQL connection through SQLAlchemy
- JWT authentication setup
- SQLAlchemy models and migration for users, claims, travel legs, and expenses
- Seed users for sales and finance roles
- Environment variable templates
- Docker Compose orchestration

The frontend is still a starter shell.

## Folder Structure

```text
.
|-- backend/
|   |-- app/
|   |   |-- models/
|   |   |   |-- claim.py
|   |   |   |-- expense.py
|   |   |   |-- travel_leg.py
|   |   |   `-- user.py
|   |   |-- routes/
|   |   |   |-- auth.py
|   |   |   |-- claims.py
|   |   |   |-- expenses.py
|   |   |   |-- health.py
|   |   |   |-- travel_legs.py
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

Claims:

- `GET /api/claims`
- `POST /api/claims`
- `GET /api/claims/:id`
- `PUT /api/claims/:id`
- `POST /api/claims/:id/submit`
- `POST /api/claims/:id/approve`
- `POST /api/claims/:id/reject`
- `POST /api/claims/:id/reimburse`
- `DELETE /api/claims/:id`

Travel legs:

- `GET /api/travel-legs`
- `POST /api/travel-legs`
- `GET /api/travel-legs/:id`
- `PUT /api/travel-legs/:id`
- `DELETE /api/travel-legs/:id`

Expenses:

- `GET /api/expenses`
- `POST /api/expenses`
- `GET /api/expenses/:id`
- `PUT /api/expenses/:id`
- `POST /api/expenses/:id/receipt`
- `DELETE /api/expenses/:id`

All non-auth endpoints require a JWT bearer token. Finance users can read all records; sales users can access records attached to their own claims.

## Salesperson Module

The frontend includes these salesperson pages:

- Dashboard: claim totals and recent claims
- Create Claim: starts a draft claim
- My Claims: claim list with status filters
- Claim Details: add travel legs, add expenses, upload receipts, and submit a draft claim

## Finance Module

The frontend includes these finance pages:

- Dashboard: Submitted Claims, Approved Claims, and Reimbursed Claims
- Claim Details: review travel legs, expenses, and receipts

Finance users can:

- Approve submitted claims
- Reject submitted claims
- Mark approved claims reimbursed
