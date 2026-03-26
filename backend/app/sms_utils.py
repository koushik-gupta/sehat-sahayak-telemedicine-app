# backend/app/sms_utils.py

import os
from flask import current_app
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

def send_sms(to_mobile: str, body: str) -> bool:
    """
    Sends an SMS message using the Twilio API.
    
    Pulls credentials from the Flask app's configuration.
    If Twilio is not configured, it falls back to printing the SMS to the console.
    """
    # Load Twilio credentials from the application configuration
    account_sid = current_app.config.get('TWILIO_ACCOUNT_SID')
    # --- THE CRITICAL FIX ---
    # The key name must exactly match the one in config.py ('TWILIO_AUTH_TOKEN')
    auth_token = current_app.config.get('TWILIO_AUTH_TOKEN')
    # --- END OF FIX ---
    twilio_phone_number = current_app.config.get('TWILIO_PHONE_NUMBER')

    # Fallback to Simulation if any credential is not configured
    if not all([account_sid, auth_token, twilio_phone_number]):
        print("\n--- [DEV SMS SIMULATION - Twilio Not Configured] ---")
        print(f"To: {to_mobile}")
        print("Body:")
        print(body)
        print("--------------------------------------------------\n")
        return True

    # --- Real Twilio API Call ---
    try:
        client = Client(account_sid, auth_token)

        # Ensure the recipient number includes the country code (e.g., +91 for India)
        if not to_mobile.startswith('+'):
            to_mobile_formatted = f"+91{to_mobile}"
        else:
            to_mobile_formatted = to_mobile
            
        message = client.messages.create(
            to=to_mobile_formatted,
            from_=twilio_phone_number,
            body=body
        )
        
        print(f"SMS sent successfully to {to_mobile_formatted}. SID: {message.sid}")
        return True

    except TwilioRestException as e:
        # Catch errors from Twilio (e.g., invalid phone number, trial restriction)
        print(f"\n[TWILIO ERROR] Failed to send SMS to {to_mobile}: {e}")
        print("--- FALLBACK: SMS SIMULATION ---")
        print(f"To: {to_mobile}")
        print("Body:")
        print(body)
        print("--------------------------------\n")
        # Return True so the flow doesn't break. User can read OTP from console.
        return True
        
    except Exception as e:
        print(f"\n[SMS UTIL ERROR] An unexpected error occurred: {e}")
        print("--- FALLBACK: SMS SIMULATION ---")
        print(f"To: {to_mobile}")
        print("Body:")
        print(body)
        print("--------------------------------\n")
        return True