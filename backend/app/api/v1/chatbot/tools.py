
# backend/app/api/v1/chatbot/tools.py

from app.db_utils import get_db_connection

def find_verified_doctors(specialty=None):
    """
    Searches for verified doctors in the database.
    Args:
        specialty (str, optional): The medical specialty to filter by (e.g., 'Cardiologist').
    Returns:
        list: A list of doctor dictionaries with details.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
        SELECT d.full_name, d.specialization, d.clinic_name, d.clinic_address, dp.fee, u.email
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN doctor_profiles dp ON d.user_id = dp.user_id
        WHERE u.role = 'doctor' AND u.status IN ('active', 'approved')
    """
    params = []
    
    if specialty:
        query += " AND d.specialization LIKE %s"
        params.append(f"%{specialty}%")
        
    cursor.execute(query, tuple(params))
    doctors = cursor.fetchall()
    
    conn.close()
    
    # Format for AI consumption
    return [
        {
            "name": doc['full_name'],
            "specialty": doc['specialization'],
            "clinic": doc['clinic_name'],
            "fee": float(doc['fee']) if doc['fee'] else "N/A",
            "address": doc['clinic_address']
        }
        for doc in doctors
    ]

def find_medicines(medicine_name):
    """
    Searches for medicines in nearby pharmacies.
    Args:
        medicine_name (str): The name of the medicine to find.
    Returns:
        list: A list of pharmacy stock entries.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
        SELECT p.chain_name, p.address, p.district, ps.price, ps.quantity
        FROM pharmacy_stock ps
        JOIN medicines m ON ps.medicine_id = m.id
        JOIN pharmacies p ON ps.pharmacy_id = p.id
        WHERE m.name LIKE %s AND ps.quantity > 0
    """
    
    cursor.execute(query, (f"%{medicine_name}%",))
    results = cursor.fetchall()
    conn.close()
    
    return [
        {
            "pharmacy": f"{row['chain_name']} ({row['district']})" if row['chain_name'] else row['address'],
            "address": row['address'],
            "price": float(row['price']) if row['price'] else "N/A",
            "stock": row['quantity']
        }
        for row in results
    ]

# Registry of available tools for the AI
AVAILABLE_TOOLS = {
    "find_doctors": find_verified_doctors,
    "find_medicines": find_medicines
}

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "find_doctors",
            "description": "Finds verified doctors based on their specialization.",
            "parameters": {
                "type": "object",
                "properties": {
                    "specialty": {
                        "type": "string",
                        "description": "The medical specialization to search for (e.g., Cardiologist, Dermatologist)."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "find_medicines",
            "description": "Finds pharmacies that have a specific medicine in stock.",
            "parameters": {
                "type": "object",
                "properties": {
                    "medicine_name": {
                        "type": "string",
                        "description": "The name of the medicine to find."
                    }
                },
                "required": ["medicine_name"]
            }
        }
    }
]
