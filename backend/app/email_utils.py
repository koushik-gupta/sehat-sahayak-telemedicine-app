# app/email_utils.py

import os
import ssl
import smtplib
from email.message import EmailMessage
from flask import current_app # Use Flask's app context to get config

def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Sends an email using SMTP configuration from the Flask app config.
    Returns True on success, False on failure.
    """
    # Load config from the current application context
    config = current_app.config
    
    MAIL_SERVER = config.get('MAIL_SERVER')
    MAIL_USERNAME = config.get('MAIL_USERNAME')
    MAIL_PASSWORD = config.get('MAIL_PASSWORD')
    
    # If mail server isn't configured, fall back to development mode (printing)
    if not all([MAIL_SERVER, MAIL_USERNAME, MAIL_PASSWORD]):
        print("\n--- [DEV EMAIL SIMULATION] ---")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print("Body:")
        print(body)
        print("------------------------------\n")
        return True

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = config.get('MAIL_DEFAULT_SENDER', MAIL_USERNAME)
    msg["To"] = to_email
    msg.set_content(body)

    try:
        context = ssl.create_default_context()
        port = config.get('MAIL_PORT', 587)
        use_ssl = config.get('MAIL_USE_SSL', False)
        use_tls = config.get('MAIL_USE_TLS', True)

        if use_ssl:
            with smtplib.SMTP_SSL(MAIL_SERVER, port, context=context) as server:
                server.login(MAIL_USERNAME, MAIL_PASSWORD)
                server.send_message(msg)
        else:
            with smtplib.SMTP(MAIL_SERVER, port) as server:
                if use_tls:
                    server.starttls(context=context)
                server.login(MAIL_USERNAME, MAIL_PASSWORD)
                server.send_message(msg)
        
        print(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"[SMTP ERROR] Could not send email to {to_email}: {e}")
        return False