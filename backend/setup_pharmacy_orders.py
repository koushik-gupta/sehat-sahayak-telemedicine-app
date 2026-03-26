
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from app.db_utils import get_db_connection
from app import create_app

def setup_pharmacy_tables():
    app = create_app()
    with app.app_context():
        print("Connecting to database...")
        conn = get_db_connection()
        if not conn:
            print("Failed to connect to database.")
            return

        cursor = conn.cursor()

    try:
        # 1. Create 'pharmacy_orders' table
        print("Creating 'pharmacy_orders' table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS pharmacy_orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pharmacy_id INT NOT NULL,
            patient_id INT NOT NULL,
            total_amount DECIMAL(10, 2) NOT NULL,
            status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
            FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """)

        # 2. Create 'pharmacy_order_items' table
        print("Creating 'pharmacy_order_items' table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS pharmacy_order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            medicine_name VARCHAR(255) NOT NULL,
            quantity INT NOT NULL,
            price_per_unit DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES pharmacy_orders(id) ON DELETE CASCADE
        )
        """)

        conn.commit()
        print("Pharmacy Order tables created successfully!")

    except Exception as e:
        conn.rollback()
        print(f"Error creating tables: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    setup_pharmacy_tables()
