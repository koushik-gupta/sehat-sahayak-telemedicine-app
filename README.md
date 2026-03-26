# SehatSahayak Telemedicine Platform

SwasthyaSetu is a role-based telemedicine platform with a React frontend, a Flask backend, and a MySQL database. The project includes patient, doctor, pharmacy, and admin workflows, plus video consultation, health record uploads, OTP-based auth flows, nearby hospital lookup, pharmacy inventory search, and AI-assisted symptom support.

## Highlights

- Multi-role experience for `patient`, `doctor`, `pharmacy`, and `admin`
- React + Vite frontend with PWA support
- Flask API with session-based authentication and WebSocket signaling
- MySQL schema and demo seed data included under `database/`
- Docker Compose setup for full local stack
- Manual development mode for separate frontend and backend workflows
- Demo accounts for quick testing

## Tech Stack

- Frontend: React 19, Vite 7, Tailwind CSS, Framer Motion, Lucide icons
- Backend: Flask, Flask-CORS, Flask-Sock, Passlib, MySQL Connector
- AI and integrations: Groq, Google Maps APIs, Deep Translator, Twilio, SMTP mail
- Database: MySQL 8
- Deployment/runtime: Docker, Nginx

## Repository Structure

```text
.
|-- backend/
|   |-- app/
|   |   |-- api/v1/
|   |   |-- config.py
|   |   |-- db_utils.py
|   |   `-- sockets.py
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

## Main Product Areas

### Patient

- Registration and login
- Doctor discovery and appointment booking
- Video consultation
- AI symptom checker
- Health record and document upload
- Nearby medicine search
- Nearby hospital search with Google Maps APIs
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
- Stock creation, update, and removal
- Medicine search and nearby stock lookup
- Order intake and dashboard tools
- Document upload for verification

### Admin

- Review pending doctor and pharmacy submissions
- Approve or reject applicants
- Browse user lists by role and status

## Prerequisites

Choose one of the following setups:

- Docker Desktop
- Or local runtimes:
  - Node.js 18+
  - npm 9+
  - Python 3.9+
  - MySQL 8

## Environment Setup

The backend reads environment variables from `backend/.env`.

1. Copy `backend/.env.example` to `backend/.env`
2. Replace placeholder values with your own credentials

Important environment variables:

- `SECRET_KEY`: Flask session secret
- `JWT_SECRET_KEY`: JWT secret used by some auth utilities
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: MySQL connection settings
- `MAIL_*`: SMTP settings for OTP and approval emails
- `TWILIO_*`: Optional SMS notifications
- `GROQ_API_KEY`: Required for chatbot responses
- `GOOGLE_MAPS_API_KEY`: Required for nearby hospital lookup
- `GOOGLE_API_KEY`: Reserved for Google AI-related features

For Docker Compose, the default database settings are:

```env
DB_HOST=db
DB_USER=root
DB_PASSWORD=root
DB_NAME=telemedicine_db
```

For a fully local backend + MySQL run, `DB_HOST` is usually `127.0.0.1` or `localhost`.

## Quick Start With Docker

This is the easiest way to run the whole app.

```powershell
cd "c:\Users\Asus\Desktop\important\telemedicine-app2(eita thik korte hobe)"
docker compose up --build
```

If your machine uses the older Compose command:

```powershell
docker-compose up --build
```

Services exposed by Docker:

- Frontend: `http://localhost`
- Backend API: `http://localhost:5001`
- MySQL: `localhost:3307`

## Local Development Without Docker

### 1. Start MySQL

Create a MySQL database named `telemedicine_db` and import one of:

- `database/init.sql` for the current dump and demo data
- `database/full_schema.sql` for the consolidated schema reference

### 2. Start the backend

```powershell
cd backend
pip install -r requirements.txt
python run.py
```

Backend runs on:

- `http://127.0.0.1:5000`

### 3. Start the frontend

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

Confirmed seeded demo accounts:

| Role | Email | Password | Notes |
|---|---|---|---|
| Patient | `patient@test.com` | `password123` | Active |
| Doctor | `doctor@test.com` | `password123` | Approved |
| Pharmacy | `pharma@test.com` | `password123` | Approved |
| Admin | `admin@test.com` | `password123` | Active |
| Doctor | `pending_doc@test.com` | `password123` | Pending admin approval |
| Pharmacy | `pending_pharma@test.com` | `password123` | Pending admin approval |

Notes:

- Pending accounts are useful for testing the approval flow.
- Additional seed rows exist in the SQL dump, but not all of them have verified public demo credentials.

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

Uploaded files are served from:

- `/uploads/<filename>`

WebSocket signaling for video consultation is exposed through:

- `/signal`

## Database Notes

The `database/` folder contains:

- `init.sql`: the current schema dump plus demo data
- `full_schema.sql`: a consolidated schema reference
- `schema_enhancements.sql`: additional schema and seed enhancements

The application uses MySQL tables for:

- users and auth state
- doctors, doctor profiles, and availability
- patients and health records
- pharmacies, stock, and orders
- appointments and prescriptions
- uploaded documents

## Files That Should Not Be Committed

The root `.gitignore` now excludes the main local-only or generated files:

- `backend/.env`
- `backend/uploads/`
- `frontend/node_modules/`
- `frontend/dist/`
- `frontend/dev-dist/`
- local TLS certs and debug logs
- the bundled project zip
- Python caches and editor folders

Before pushing, make sure you do not manually force-add ignored files.

## Recommended GitHub Push Flow

Once you are happy with the project state:

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

If you already created the GitHub repo first, replace `<your-github-repo-url>` with the repository clone URL.

## Troubleshooting

### Login works locally but not through Docker

The frontend should call relative `/api/...` paths. This repository now uses that pattern for login as well.

### Doctor or pharmacy users cannot log in after admin approval

The backend now treats both `active` and `approved` as valid statuses for doctor and pharmacy access.

### Nearby hospitals fail

Set `GOOGLE_MAPS_API_KEY` in `backend/.env`.

### Chatbot fails

Set `GROQ_API_KEY` in `backend/.env`.

### OTP mail fails

Configure the `MAIL_*` SMTP values correctly.

### SMS fails

Set the Twilio credentials or leave SMS features unused.

## Validation Checklist Before Pushing

- Copy `backend/.env.example` to `backend/.env`
- Confirm Docker or local database credentials are correct
- Make sure `backend/.env` is not staged
- Do not commit `backend/uploads/` or local certificates
- Run the frontend lint/build checks
- Run a backend syntax check
- Verify at least one account can log in for each workflow you want to demo

## Additional Notes

- `Friend_Guide.md` remains as a lightweight setup note for non-technical collaborators.
- `frontend/README.md` from the Vite starter is not the main project documentation. Use this root README as the canonical guide.
