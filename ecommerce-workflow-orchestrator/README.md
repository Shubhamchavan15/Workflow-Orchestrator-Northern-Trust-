# Ecommerce Workflow Orchestrator

A full-stack DAG-based workflow orchestration system for ecommerce order processing, built for the Northern Trust demo. It simulates a real-world microservices architecture where each order flows through inventory check, payment, shipping, and notification stages — with automatic failure detection, retry logic, real-time alerts, and email notifications.

---

## Architecture Overview

```
User Portal (React)
      │
      ▼
Orchestrator Backend (FastAPI :8000)
      │
      ├──► Inventory Service  (:8002)  — stock check
      ├──► Payment Service    (:8001)  — charge customer
      ├──► Shipping Service   (:8003)  — dispatch order
      └──► Notification Svc   (:8004)  — send email
                │
                ▼
         Admin Dashboard (React)
         Alerts · Logs · Executions
```

### Workflow Order (DAG)
```
Order Received → Inventory Check → Payment → Shipping + Notification (parallel) → Completed
```

---

## Services

| Service | Port | Tech | Description |
|---|---|---|---|
| Orchestrator Backend | 8000 | FastAPI | DAG engine, retry logic, state management |
| Payment Service | 8001 | FastAPI | Processes payments (40% random failure for demo) |
| Inventory Service | 8002 | FastAPI | Checks stock availability |
| Shipping Service | 8003 | FastAPI | Dispatches orders |
| Notification Service | 8004 | FastAPI + SMTP | Sends real emails via Gmail |
| Admin Dashboard | 5173 | React + Vite | Monitoring, alerts, logs, settings |
| User Portal | 5174 | React + Vite | Place orders, track status |

---

## Prerequisites

- **Python 3.9+** — https://www.python.org/downloads/
- **Node.js 18+** — https://nodejs.org/
- **Gmail App Password** — for real email notifications (see Setup below)

---

## Quick Start

### Option 1 — One command (Windows)

```cmd
cd ecommerce-workflow-orchestrator
.\start.bat
```

> Note: Edit `start.bat` and replace the `ROOT` path with your actual project path before running.

---

### Option 2 — Manual (recommended)

Open **7 separate terminals** and run one command per terminal:

**Terminal 1 — Inventory Service**
```powershell
cd inventory-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8002 --reload
```

**Terminal 2 — Payment Service**
```powershell
cd payment-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8001 --reload
```

**Terminal 3 — Shipping Service**
```powershell
cd shipping-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8003 --reload
```

**Terminal 4 — Notification Service**
```powershell
cd notification-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8004 --reload
```

**Terminal 5 — Orchestrator Backend**
```powershell
cd orchestrator-backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```

**Terminal 6 — Admin Dashboard**
```powershell
cd frontend-dashboard
npm install
npm run dev
```

**Terminal 7 — User Portal**
```powershell
cd frontend-user
npm install
npm run dev
```

---

## Access URLs

| App | URL |
|---|---|
| Admin Dashboard | http://localhost:5173 |
| User Portal | http://localhost:5174 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Payment Service Docs | http://localhost:8001/docs |
| Inventory Service Docs | http://localhost:8002/docs |

---

## Email Notifications Setup (Gmail)

The notification service sends real emails via Gmail SMTP.

**Step 1** — Enable 2-Step Verification on your Google account:
https://myaccount.google.com/security

**Step 2** — Generate an App Password:
https://myaccount.google.com/apppasswords
- App name: `Orchestrator` → click **Create**
- Copy the 16-character password (remove spaces)

**Step 3** — Edit `notification-service/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASSWORD=yourapppassword
SMTP_FROM=your_gmail@gmail.com
```

**Step 4** — Restart the notification service.

**Step 5** — Go to Admin Dashboard → Settings → enter admin email → click **Send Test**.

---

## Features

### Admin Dashboard
- **Overview** — live stats: total workflows, running, completed, failed
- **Workflows** — searchable list with status filter (All / Running / Completed / Failed)
- **Executions** — DAG progress visualization per execution
- **Logs** — real-time log stream with keyword filter, color-coded by status
- **Alerts** — live alert feed with severity badges, auto-refresh every 10s, resolve button
- **Settings** — configure admin email, retry count, test email delivery
- **Notification Bell** — live badge in navbar, dropdown with latest alerts
- **Dark Mode** — toggle in navbar, persisted to localStorage

### User Portal
- **Shop** — 12 products across 5 categories (Electronics, Audio, Gaming, Accessories, Office)
- **Product cards** — images, star ratings, review counts, category badges
- **Cart** — sticky floating cart bar with item count and total
- **Checkout** — 2-step flow: browse → checkout form
- **Order tracking** — real-time polling after order placed, shows task-by-task status
- **Failure screen** — shows which step failed, confirms notification was sent
- **Dark Mode** — toggle in header, persisted to localStorage

### Workflow Engine
- DAG-based execution (tasks run in dependency order)
- Parallel branches (shipping + notification run simultaneously)
- Exponential backoff retry (3 attempts, 2s → 4s → 8s)
- Automatic failure detection — `success: false` from any service triggers retry then alert
- File-based persistence (no database required) — data saved to `orchestrator-backend/data/`

### Payment Simulation
- **40% random failure rate** on every order for demo purposes
- Failure scenarios: card declined, fraud detected, gateway timeout, invalid card, limit exceeded
- Force failure via "Force Payment Failure" checkbox in User Portal

### Notifications
- Customer email on payment/order failure
- Admin email on every failure (configured in Settings)
- Order confirmation email on success
- HTML email templates with color-coded styling

---

## Project Structure

```
ecommerce-workflow-orchestrator/
├── orchestrator-backend/       # FastAPI — DAG engine
│   ├── app/
│   │   ├── orchestrator/       # engine, executor, retry, state manager
│   │   ├── routes/             # workflow, dashboard, settings routes
│   │   └── database/           # file-based JSON store
│   ├── workflows/
│   │   └── order_workflow.json # DAG definition
│   └── data/                   # runtime data (executions, logs, alerts)
├── payment-service/            # FastAPI — payment processing
├── inventory-service/          # FastAPI — stock check
├── shipping-service/           # FastAPI — dispatch
├── notification-service/       # FastAPI + SMTP — email delivery
├── frontend-dashboard/         # React + Vite — admin UI
└── frontend-user/              # React + Vite — customer UI
```

---

## Demo Walkthrough

1. Start all 7 services
2. Open User Portal → http://localhost:5174
3. Browse products, add to cart, proceed to checkout
4. Fill in customer details and place order
5. Watch the real-time status screen — spinner → success/failure
6. If payment fails: customer sees failure screen, notification service logs the email
7. Switch to Admin Dashboard → http://localhost:5173
8. Bell icon shows red badge with unresolved alert count
9. Click bell → dropdown shows the failed payment alert
10. Go to Alerts page → see full details with customer name, amount, failure reason
11. Go to Logs → see full execution trace
12. Go to Settings → enter admin email → Save → future failures notify you too

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Recharts, ReactFlow |
| Backend | Python 3.12, FastAPI, Uvicorn, Pydantic |
| Storage | File-based JSON (no external DB required) |
| Email | Python smtplib + Gmail SMTP |
| Styling | Tailwind CSS with dark mode (class strategy) |
