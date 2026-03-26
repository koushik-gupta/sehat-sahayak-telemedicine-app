# Friend's Guide to Running SwasthyaSetu

This guide is for someone who just wants the project running locally with the least setup possible.

## 1. Install Prerequisites

1. Install Docker Desktop from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Start Docker Desktop and wait until it is fully running

## 2. Get the Code

1. Download the project folder or clone it from GitHub
2. Open the project folder
3. Make sure you can see `backend`, `frontend`, and `docker-compose.yml`

## 3. Create the Backend `.env`

1. Open the `backend` folder
2. Copy `.env.example`
3. Rename the copy to `.env`
4. Fill in the values you actually want to use

The app now uses SQLite by default, so you do not need MySQL or MySQL Workbench.

Minimal example:

```ini
SECRET_KEY=change_this_to_a_long_random_secret
JWT_SECRET_KEY=change_this_to_a_second_long_random_secret

MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=your_email@gmail.com

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

GOOGLE_API_KEY=
GROQ_API_KEY=
GOOGLE_MAPS_API_KEY=
```

You can leave `DB_PATH` and `SQLITE_SEED_PATH` empty unless you want custom locations.

## 4. Run the App

1. Open PowerShell or Command Prompt
2. Go to the project folder

```powershell
cd path\to\telemedicine
```

3. Start everything

```powershell
docker compose up --build
```

If your Docker still uses the old Compose command:

```powershell
docker-compose up --build
```

On first boot, the backend will automatically create the SQLite database from the bundled demo seed.

## 5. Open the App

After the containers finish starting:

- Frontend: [http://localhost](http://localhost)
- Backend: [http://localhost:5001](http://localhost:5001)

## 6. Demo Login Accounts

- Patient: `patient@test.com` / `password123`
- Doctor: `doctor@test.com` / `password123`
- Pharmacy: `pharma@test.com` / `password123`
- Admin: `admin@test.com` / `password123`

## Troubleshooting

### The app starts but login fails

Delete the local runtime database and restart:

```powershell
Remove-Item -Force .\backend\data\telemedicine.sqlite3
docker compose up --build
```

### Uploaded files disappear

The uploads are stored in `backend/uploads`. Do not delete that folder if you want to keep uploaded files.

### The browser still shows an old broken version

Because this is a PWA, try one of these:

1. Open the app in an incognito/private window
2. Clear browser site data

### I want to stop the app

Press `Ctrl+C` in the terminal.

To remove the containers:

```powershell
docker compose down
```
