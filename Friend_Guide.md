# Friend's Guide to Running SwasthyaSetu 🏥

Hello! If you are reading this, you are about to run the Telemedicine App. Follow these steps exactly to get everything running on your laptop.

## 1. Install Prerequisites

1.  **Download & Install Docker Desktop**:
    - Go to [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).
    - Download and install it for Windows/Mac/Linux.
    - **Start Docker Desktop** and wait for the whale icon to stop animating.

## 2. Get the Code

You should have received the entire project folder (e.g., as a zip file or a GitHub link).
1.  **Download and Unzip** the project to a location on your laptop.
2.  Open that folder. You should see folders like `backend`, `frontend`, `database`, and a file named `docker-compose.yml`.

## 3. Configure the `.env` File

1.  Go to the `backend` folder.
2.  Look for a file named `.env.example`.
3.  **Copy** this file and rename the copy to `.env`.
4.  Open the new `.env` file and fill in the details.

Here is what it should look like (mostly default, but add your API keys):

```ini
# Database (DO NOT CHANGE THESE! They assume you are running in Docker)
DB_HOST=db
DB_USER=root
DB_PASSWORD=root
DB_NAME=telemedicine_db

# Security (Change these to something random)
SECRET_KEY=change_this_to_random_secret
JWT_SECRET_KEY=change_this_to_random_jwt_key

# Email (For sending notifications)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=your_email@gmail.com

# Twilio (For SMS - Optional)
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_PHONE_NUMBER=your_twilio_number

# AI (For features like Chatbot)
GOOGLE_API_KEY=your_google_api_key
GROQ_API_KEY=your_groq_api_key_here
```

## 4. Run the App!

1.  Open **Command Prompt** (cmd) or PowerShell.
2.  Navigate to your folder:
    ```powershell
    cd path\to\telemedicine
    ```
3.  Run this command:
    ```powershell
    docker-compose up --build
    ```
    *(Note: The first time you run this, it will download about 500MB+ of data. Be patient!)*

## 5. Access the App

Once you see logs like "Running on http://0.0.0.0:5000" and "ready for connections", open your browser:

- **Frontend (Website)**: [http://localhost](http://localhost)
- **Backend (API)**: [http://localhost:5001](http://localhost:5001)

## Troubleshooting

- **Port Error**: If you see "Bind for 0.0.0.0:3307 failed", make sure no other Docker container is using port 3307.
- **Database Error**: If the app says "Can't connect to MySQL server", wait a minute. The database takes a little longer to start than the app.
- **Stopping**: Press `Ctrl+C` in the terminal to stop. To remove everything, run `docker-compose down`.

## Common Questions

**Q: Do I need to install MySQL Workbench or create a database manually?**
A: **No!** Docker does this automatically. It creates the database and imports all the data for you when you run `docker-compose up`. You don't need to do anything.

**Q: The app says "Failed to fetch" or "Database not found". What do I do?**
A: This happens if the Database takes longer to start than the Backend.
**Fix:**
1.  Wait 10 seconds.
2.  Refresh the page.
3.  If it still fails, run this command to reset everything (WARNING: Deletes current data):
    ```powershell
    docker-compose down -v
    docker-compose up --build
    ```
**Q: I still see errors or the app behaves weirdly?**
A: Since this is a PWA (Progressive Web App), the browser might be caching an old, broken version.
**Fix:**
1.  Open the app in an **Incognito / Private Window**.
2.  Or clear your browser cache (Application -> Clear Storage -> Clear Site Data).


