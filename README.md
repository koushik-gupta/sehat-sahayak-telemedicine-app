# SwasthyaSetu Telemedicine Platform

SwasthyaSetu is a role-based telemedicine platform with a React frontend, a Flask backend, and a bundled SQLite demo database. The app supports patient, doctor, pharmacy, and admin workflows, along with video consultation, document uploads, OTP-based flows, nearby medicine and hospital search, and AI-assisted symptom support.

## What Changed

This repository now uses SQLite by default instead of MySQL.

- No MySQL server or Workbench setup is required
- The backend creates `backend/data/telemedicine.sqlite3` automatically on first boot
- The first runtime database is copied from `backend/seed/telemedicine.seed.sqlite3`
- Existing Render and Vercel deployment-safe configuration is preserved

## Highlights

- Multi-role experience for `patient`, `doctor`, `pharmacy`, and `admin`
- React + Vite frontend with PWA support
- Flask API with session-based auth and WebSocket signaling
- SQLite seed database bundled with the repo
- Docker Compose setup for local full-stack runs
- Local dev workflow for running frontend and backend separately
- Demo accounts included for testing

## Tech Stack

- Frontend: React 19, Vite 7, Tailwind CSS, Framer Motion, Lucide icons
- Backend: Flask, Flask-CORS, Flask-Sock, Passlib
- Database: SQLite
- Integrations: Groq, Google Maps APIs, Deep Translator, Twilio, SMTP mail
- Deployment/runtime: Docker, Nginx, Render, Vercel

## Repository Structure

```text
.
|-- backend/
|   |-- app/
|   |   |-- api/v1/
|   |   |-- config.py
|   |   |-- db_utils.py
|   |   `-- sockets.py
|   |-- scripts/
|   |   `-- build_sqlite_seed.py
|   |-- seed/
|   |   `-- telemedicine.seed.sqlite3
|   |-- .env.example
|   |-- requirements.txt
|   `-- run.py
|-- database/
|   |-- init.sql
|   |-- full_schema.sql
|   `-- schema_enhancements.sql
|-- frontend/
|   |-- public/
|   |-- src/
|   |-- package.json
|   |-- vite.config.js
|   `-- nginx.conf
|-- docker-compose.yml
|-- Friend_Guide.md
`-- README.md
```

## Product Areas

### Patient

- Registration and login
- Doctor discovery and appointment booking
- Video consultation
- AI symptom checker
- Health record and document upload
- Nearby medicine search
- Nearby hospital search
- Profile updates

### Doctor

- Login and approval workflow
- Doctor profile editing
- Availability management
- Appointment and patient views
- Prescription generation
- Consultation tools and analytics
- Document upload for verification

### Pharmacy

- Login and approval workflow
- Pharmacy profile management
- Stock management
- Medicine search and nearby stock lookup
- Order intake and dashboard tools
- Document upload for verification

### Admin

- Review pending doctor and pharmacy submissions
- Approve or reject applicants
- Browse users by role and status

## Prerequisites

Choose one of these setups:

- Docker Desktop
- Or local runtimes:
  - Node.js 18+
  - npm 9+
  - Python 3.9+

No separate database server is required for the default setup.

## Environment Setup

The backend reads environment variables from `backend/.env`.

1. Copy `backend/.env.example` to `backend/.env`
2. Fill in the secrets and optional API keys you want to use

Important variables:

- `SECRET_KEY`: Flask session secret
- `JWT_SECRET_KEY`: JWT secret
- `DB_PATH`: runtime SQLite database file
- `SQLITE_SEED_PATH`: tracked seed database copied on first boot
- `PUBLIC_BACKEND_URL`: public backend URL for production-generated media links
- `CORS_ORIGINS`: allowed frontend origins, comma-separated
- `SESSION_COOKIE_SECURE`: should be `true` in production HTTPS deployments
- `SESSION_COOKIE_SAMESITE`: use `None` for split-domain Vercel + Render deployments
- `UPLOAD_FOLDER`: persistent upload folder path
- `MAIL_*`: SMTP settings for OTP and approval email
- `TWILIO_*`: optional SMS notifications
- `GROQ_API_KEY`: required for chatbot responses
- `GOOGLE_MAPS_API_KEY`: required for nearby hospital lookup

Local defaults if you leave the SQLite values blank:

```env
DB_PATH=data/telemedicine.sqlite3
SQLITE_SEED_PATH=seed/telemedicine.seed.sqlite3
SQLITE_SCHEMA_PATH=seed/telemedicine.schema.sql
```

Docker / Render example:

```env
DB_PATH=/app/data/telemedicine.sqlite3
SQLITE_SEED_PATH=/app/seed/telemedicine.seed.sqlite3
UPLOAD_FOLDER=/app/uploads
```

## Quick Start With Docker

This is the easiest way to run the whole app locally.

```powershell
cd "c:\Users\Asus\Desktop\important\telemedicine-app2(eita thik korte hobe)"
docker compose up --build
```

If your machine still uses the older Compose command:

```powershell
docker-compose up --build
```

Services exposed by Docker:

- Frontend: `http://localhost`
- Backend API: `http://localhost:5001`

Persisted local folders:

- `backend/data/` for the SQLite database
- `backend/uploads/` for uploaded files

## Local Development Without Docker

### 1. Start the backend

```powershell
cd backend
pip install -r requirements.txt
python run.py
```

On first boot the backend will create:

- `backend/data/telemedicine.sqlite3`

Backend runs on:

- `http://127.0.0.1:5000`

### 2. Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on:

- `http://localhost:5173`

The Vite dev server proxies:

- `/api` -> Flask backend on `127.0.0.1:5000`
- `/uploads` -> Flask backend on `127.0.0.1:5000`
- `/signal` -> WebSocket signaling server on `ws://127.0.0.1:5000`

## Demo Accounts

Core demo accounts:

| Role | Email | Password | Notes |
|---|---|---|---|
| Patient | `patient@test.com` | `password123` | Active |
| Doctor | `doctor@test.com` | `password123` | Approved |
| Pharmacy | `pharma@test.com` | `password123` | Approved |
| Admin | `admin@test.com` | `password123` | Active |

Additional seed accounts:

| Role | Email | Password | Notes |
|---|---|---|---|
| Doctor | `pending_doc@test.com` | `password123` | Pending admin approval |
| Pharmacy | `pending_pharma@test.com` | `password123` | Pending admin approval |

## Backend Route Overview

Main route groups under `backend/app/api/v1/`:

- `auth`: register, login, logout, OTP, password reset, session restore
- `admin`: approvals and user management
- `user`: profile updates and document management
- `patient`: nearby hospital search
- `doctor`: profile, availability, patients, prescriptions, analytics
- `appointment`: booking, appointment lists, translation, uploads, prescription PDFs
- `pharmacy`: profile, stock, search, nearby stock, orders
- `chatbot`: AI assistant with doctor and medicine lookup tools

Uploaded files are served from `/uploads/<filename>`.

WebSocket signaling for video consultation is exposed through `/signal`.

## SQLite Seed Database

The tracked demo database lives at:

- `backend/seed/telemedicine.seed.sqlite3`

The runtime database is created at:

- `backend/data/telemedicine.sqlite3` locally
- `/app/data/telemedicine.sqlite3` in Docker or Render if you set `DB_PATH`

If you want to rebuild the seed from SQL, use:

```powershell
python backend\scripts\build_sqlite_seed.py
```

This uses `database/init.sql` by default.

If you want to rebuild from your private local MySQL dump instead, use:

```powershell
python backend\scripts\build_sqlite_seed.py --source telemedicine_db_dump.sql
```

Do not commit private dumps that contain real personal data.

## Deployment Notes

### Recommended hosting layout

- Frontend: Vercel
- Backend: Render Web Service
- Database file: Render persistent disk mounted into the backend
- Uploads: Render persistent disk or another persistent storage path

### Render backend settings

Recommended environment variables:

```env
DB_PATH=/app/data/telemedicine.sqlite3
SQLITE_SEED_PATH=/app/seed/telemedicine.seed.sqlite3
UPLOAD_FOLDER=/app/uploads
PUBLIC_BACKEND_URL=https://your-backend.onrender.com
CORS_ORIGINS=https://your-frontend.vercel.app
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=None
```

Recommended disks:

- Mount one persistent disk at `/app/data`
- Mount one persistent disk at `/app/uploads`

### Vercel frontend settings

Set:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_WS_BASE_URL=wss://your-backend.onrender.com
```

## Files That Should Not Be Committed

The root `.gitignore` and backend `.gitignore` exclude the main local-only or generated files:

- `backend/.env`
- `backend/data/`
- `backend/uploads/`
- `frontend/node_modules/`
- `frontend/dist/`
- local TLS certs and debug logs
- `.tools/`
- editor folders
- `telemedicine_db_dump.sql`

Before pushing, do not manually force-add ignored files.

## Troubleshooting

### The app starts but demo users cannot log in

Delete `backend/data/telemedicine.sqlite3` and start the backend again so it re-copies the latest seed.

### Doctor or pharmacy users cannot log in after approval

The backend accepts both `active` and `approved` for doctor and pharmacy access.

### Nearby hospitals fail

Set `GOOGLE_MAPS_API_KEY` in `backend/.env`.

### Chatbot fails

Set `GROQ_API_KEY` in `backend/.env`.

### OTP mail fails

Configure the `MAIL_*` values correctly.

### Uploaded files disappear after deployment

Your backend storage is ephemeral. Mount a persistent disk for `/app/uploads`.

### Data resets after deployment

Your backend storage is ephemeral. Mount a persistent disk for `/app/data`.

## Validation Checklist

- Copy `backend/.env.example` to `backend/.env`
- Make sure `backend/.env` is not staged
- Do not commit `backend/data/`, `backend/uploads/`, or local certificates
- Run `python -m compileall backend`
- Run `npm run build` inside `frontend`
- Verify the four main demo accounts can log in

## Notes

- `Friend_Guide.md` is a lighter quick-start for non-technical collaborators.
- `frontend/README.md` from the Vite starter is not the main documentation. Use this root README as the primary guide.
