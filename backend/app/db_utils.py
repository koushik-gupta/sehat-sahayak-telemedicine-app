# app/db_utils.py

import mysql.connector
from flask import current_app # Used to access the application's configuration

def get_db_connection():
    """
    Establishes and returns a connection to the MySQL database.
    The connection details are fetched from the current Flask app's configuration.
    """
    try:
        # Connect to the database using the configuration variables
        conn = mysql.connector.connect(
            host=current_app.config['DB_HOST'],
            user=current_app.config['DB_USER'],
            password=current_app.config['DB_PASSWORD'],
            database=current_app.config['DB_NAME']
        )
        # Check if the connection was successful
        if conn.is_connected():
            return conn
        else:
            print("Failed to connect to the database.")
            return None
            
    except mysql.connector.Error as e:
        # Log the error if the connection fails for any reason
        current_app.logger.error(f"Error connecting to MySQL Database: {e}")
        return None