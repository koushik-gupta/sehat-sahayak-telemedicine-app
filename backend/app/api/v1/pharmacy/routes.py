from flask import Blueprint, request, jsonify, current_app
from app.db_utils import get_db_connection
from app.api.v1.auth.utils import login_required
from datetime import datetime, date, timedelta
import requests

pharmacy_bp = Blueprint('pharmacy_bp', __name__, url_prefix='/api/v1/pharmacy')


# --- PHARMACIST DASHBOARD ENDPOINTS (Necessary for data entry) ---
@pharmacy_bp.route('/profile', methods=['GET'])
@login_required
def get_pharmacy_profile(current_user):
    if current_user.get('role') != 'pharmacy': return jsonify({"error": "Unauthorized"}), 403
    user_id = current_user.get('id')
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True, buffered=True)
    try:
        cursor.execute("""
            SELECT u.id, u.full_name, u.email, u.mobile, p.id as pharmacy_id, p.address,
                   p.license_number, p.home_delivery,
                   p.chain_name, p.district, p.state,
                   p.opening_time,
                   p.closing_time
            FROM users u LEFT JOIN pharmacies p ON u.id = p.user_id WHERE u.id = %s
        """, (user_id,))
        pharmacy_profile = cursor.fetchone()
        if not pharmacy_profile: return jsonify({"error": "Profile not found"}), 404
        
        # Convert 1/0 to boolean
        if 'home_delivery' in pharmacy_profile:
             pharmacy_profile['home_delivery'] = bool(pharmacy_profile['home_delivery'])
        if pharmacy_profile.get('opening_time'):
             pharmacy_profile['opening_time'] = str(pharmacy_profile['opening_time'])[:5]
        if pharmacy_profile.get('closing_time'):
             pharmacy_profile['closing_time'] = str(pharmacy_profile['closing_time'])[:5]

        # Fetch Stock with IDs for granular updates
        cursor.execute("""
            SELECT ps.id, m.name as medicine_name, ps.quantity, ps.price 
            FROM pharmacy_stock ps
            JOIN medicines m ON ps.medicine_id = m.id
            WHERE ps.pharmacy_id = %s
        """, (pharmacy_profile['pharmacy_id'],))
        stock_items = cursor.fetchall()
        
        # New List Format
        pharmacy_profile['stock'] = [
            {
                'id': item['id'],
                'medicine_name': item['medicine_name'].capitalize(),
                'quantity': item['quantity'], 
                'price': float(item['price']) if item['price'] else 0
            } 
            for item in stock_items
        ]
        
        return jsonify(pharmacy_profile), 200
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return jsonify({"error": "An internal error occurred"}), 500
    finally:
        cursor.close()
        conn.close()

# --- Granular Stock Management API ---

@pharmacy_bp.route('/stock', methods=['POST'])
@login_required
def add_stock_item(current_user):
    if current_user.get('role') != 'pharmacy': return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    medicine_name = data.get('medicine_name')
    if not medicine_name: return jsonify({"error": "Medicine name is required"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Get Pharmacy ID
        cursor.execute("SELECT id FROM pharmacies WHERE user_id = %s", (current_user['id'],))
        pharmacy = cursor.fetchone()
        if not pharmacy: return jsonify({"error": "Pharmacy profile not found"}), 404
        pharmacy_id = pharmacy['id']

        # Get/Create Medicine ID
        name_clean = medicine_name.lower().strip()
        cursor.execute("SELECT id FROM medicines WHERE name = %s", (name_clean,))
        med = cursor.fetchone()
        if not med:
            cursor.execute("INSERT INTO medicines (name) VALUES (%s)", (name_clean,))
            medicine_id = cursor.lastrowid
        else:
            medicine_id = med['id']

        # Insert Stock
        cursor.execute("""
            INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
            VALUES (%s, %s, %s, %s)
        """, (pharmacy_id, medicine_id, data.get('quantity', 0), data.get('price', 0)))
        
        new_id = cursor.lastrowid
        conn.commit()
        
        return jsonify({
            "message": "Item added", 
            "item": {
                "id": new_id, 
                "medicine_name": medicine_name.capitalize(),
                "quantity": data.get('quantity', 0),
                "price": data.get('price', 0)
            }
        }), 201
    except Exception as e:
        conn.rollback()
        print(f"Error adding stock: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

@pharmacy_bp.route('/stock/<int:stock_id>', methods=['PUT'])
@login_required
def update_stock_item(current_user, stock_id):
    if current_user.get('role') != 'pharmacy': return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Verify ownership
        cursor.execute("""
            SELECT ps.id FROM pharmacy_stock ps
            JOIN pharmacies p ON ps.pharmacy_id = p.id
            WHERE ps.id = %s AND p.user_id = %s
        """, (stock_id, current_user['id']))
        if not cursor.fetchone():
            return jsonify({"error": "Stock item not found or unauthorized"}), 404
            
        cursor.execute("""
            UPDATE pharmacy_stock 
            SET quantity = %s, price = %s
            WHERE id = %s
        """, (data.get('quantity'), data.get('price'), stock_id))
        conn.commit()
        return jsonify({"message": "Updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

@pharmacy_bp.route('/stock/<int:stock_id>', methods=['DELETE'])
@login_required
def delete_stock_item(current_user, stock_id):
    if current_user.get('role') != 'pharmacy': return jsonify({"error": "Unauthorized"}), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            DELETE FROM pharmacy_stock
            WHERE id = %s
              AND pharmacy_id IN (SELECT id FROM pharmacies WHERE user_id = %s)
        """, (stock_id, current_user['id']))
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Item not found"}), 404
            
        conn.commit()
        return jsonify({"message": "Deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

# Keep update_pharmacy_full_profile for Profile details ONLY (address etc)
# But remove stock logic from it to encourage granular updates
@pharmacy_bp.route('/update-details', methods=['PUT'])
@login_required
def update_pharmacy_details_only(current_user):
    data = request.get_json()
    user_id = current_user['id']
    details = data.get('details', data) # Handle both nested and flat for backward compat if needed

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE pharmacies SET address=%s, license_number=%s, home_delivery=%s, opening_time=%s, closing_time=%s, chain_name=%s, district=%s, state=%s WHERE user_id=%s",
        (details.get('address'), details.get('license_number'), details.get('home_delivery'), details.get('opening_time'), details.get('closing_time'), details.get('chain_name'), details.get('district'), details.get('state'), user_id))
        conn.commit()
        return jsonify({"message": "Details updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


# --- PATIENT-FACING SEARCH ENDPOINT (SIMPLIFIED) ---
@pharmacy_bp.route('/search', methods=['GET'])
def search_medicines_simple():
    medicine_name = request.args.get('medicine')
    if not medicine_name:
        return jsonify({"error": "Medicine name is required"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        search_term_lower = medicine_name.lower().strip()
        
        query = """
            SELECT u.full_name AS name, p.address, p.district, p.state, ps.quantity, ps.price
            FROM pharmacies p
            JOIN users u ON p.user_id = u.id
            JOIN pharmacy_stock ps ON p.id = ps.pharmacy_id
            JOIN medicines m ON ps.medicine_id = m.id
            WHERE LOWER(m.name) = %s AND ps.quantity > 0
        """
        
        cursor.execute(query, (search_term_lower,))
        pharmacies = cursor.fetchall()
        
        return jsonify(pharmacies), 200
        
    except Exception as e:
        print(f"Error in simplified search: {e}")
        return jsonify({"error": "An internal error occurred"}), 500
    finally:
        cursor.close()
        conn.close()

# --- NEARBY STOCK ENDPOINT (CROSS-BRANCH) ---
@pharmacy_bp.route('/nearby-stock', methods=['GET'])
@login_required
def get_nearby_stock(current_user):
    if current_user.get('role') != 'pharmacy': return jsonify({"error": "Unauthorized"}), 403
    
    user_id = current_user.get('id')
    print(request.args)
    medicine_name = request.args.get('medicine') # Optional filter
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    
    try:
        # 1. Get current pharmacy details
        cursor.execute("SELECT id, chain_name, district, state FROM pharmacies WHERE user_id = %s", (user_id,))
        my_pharmacy = cursor.fetchone()
        
        if not my_pharmacy or not my_pharmacy['chain_name']:
            return jsonify([]), 200 # No chain info, cannot see others
            
        chain = my_pharmacy['chain_name']
        my_id = my_pharmacy['id']
        district = my_pharmacy['district']
        state = my_pharmacy['state']
        
        # 2. Find other pharmacies in same chain AND (same district OR same state)
        # Exclude self
        query = """
            SELECT p.id, p.address, p.district, p.state, m.name as medicine_name, ps.quantity, ps.price
            FROM pharmacies p
            JOIN pharmacy_stock ps ON p.id = ps.pharmacy_id
            JOIN medicines m ON ps.medicine_id = m.id
            WHERE p.chain_name = %s 
            AND p.id != %s
            AND (p.district = %s OR p.state = %s)
            AND ps.quantity > 0
        """
        params = [chain, my_id, district, state]
        
        if medicine_name:
            query += " AND LOWER(m.name) = %s"
            params.append(medicine_name.lower().strip())
            
        cursor.execute(query, tuple(params))
        results = cursor.fetchall()
        
        return jsonify(results), 200
        
    except Exception as e:
        print(f"Error fetching nearby stock: {e}")
        return jsonify({"error": "An internal error occurred"}), 500
    finally:
        cursor.close()
        conn.close()



@pharmacy_bp.route('/debug-profile', methods=['GET'])
@login_required
def debug_pharmacy_profile(current_user):
    """
    Returns raw profile data for debugging purposes.
    """
    if current_user.get('role') != 'pharmacy': 
         return jsonify({"error": "Unauthorized"}), 403
         
    user_id = current_user.get('id')
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        # Get raw user data
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user_data = cursor.fetchone()
        
        # Get raw pharmacy data
        cursor.execute("SELECT * FROM pharmacies WHERE user_id = %s", (user_id,))
        pharmacy_data = cursor.fetchone()
        
        # Get raw stock data
        cursor.execute("SELECT * FROM pharmacy_stock WHERE pharmacy_id = %s", (pharmacy_data['id'] if pharmacy_data else 0,))
        stock_data = cursor.fetchall()

        # Helper to serialize date/time objects
        def json_serial(obj):
            if isinstance(obj, (datetime, date)):
                return obj.isoformat()
            if isinstance(obj, timedelta):
                return str(obj)
            return obj

        return jsonify({
            "user": {k: json_serial(v) for k, v in user_data.items()} if user_data else None,
            "pharmacy": {k: json_serial(v) for k, v in pharmacy_data.items()} if pharmacy_data else None,
            "stock_raw": [{k: json_serial(v) for k, v in item.items()} for item in stock_data]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# --- ORDER PLACEMENT ENDPOINT ---
@pharmacy_bp.route('/order', methods=['POST'])
@login_required
def place_order(current_user):
    if current_user.get('role') != 'patient': 
        return jsonify({"error": "Only patients can place orders"}), 403

    data = request.get_json()
    pharmacy_name = data.get('pharmacy_name')
    items = data.get('items', [])

    if not pharmacy_name or not items:
        return jsonify({"error": "Missing pharmacy name or items"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)

    try:
        # 1. Start Transaction
        conn.start_transaction()

        # 2. Find Pharmacy ID by Name (Assuming unique names for simplicity or pass ID from frontend)
        pharmacy_id = data.get('pharmacy_id')
        if not pharmacy_id:
             cursor.execute("SELECT id FROM pharmacies WHERE chain_name = %s LIMIT 1", (pharmacy_name,)) # Fallback
             pharmacy_record = cursor.fetchone()
             if not pharmacy_record:
                 return jsonify({"error": f"Pharmacy '{pharmacy_name}' not found"}), 404
             pharmacy_id = pharmacy_record['id']

        # 3. Calculate Total & Prepare Order
        total_amount = sum(float(item.get('price', 0)) * int(item.get('quantity', 1)) for item in items)
        
        # 4. Create Order
        cursor.execute("""
            INSERT INTO pharmacy_orders (pharmacy_id, patient_id, total_amount, status)
            VALUES (%s, %s, %s, 'pending')
        """, (pharmacy_id, current_user['id'], total_amount))
        order_id = cursor.lastrowid

        # 5. Process Items & Update Stock
        for item in items:
            med_name = item.get('medicineName')
            qty = int(item.get('quantity', 1))
            price = float(item.get('price', 0))

            # Insert Order Item
            cursor.execute("""
                INSERT INTO pharmacy_order_items (order_id, medicine_name, quantity, price_per_unit)
                VALUES (%s, %s, %s, %s)
            """, (order_id, med_name, qty, price))

            # Deduct Stock
            # We need to find the medicine_id for this name first
            cursor.execute("SELECT id FROM medicines WHERE name = %s", (med_name,))
            med_record = cursor.fetchone()
            
            if med_record:
                med_id = med_record['id']
                # Decrease quantity, ensure non-negative
                cursor.execute("""
                    UPDATE pharmacy_stock 
                    SET quantity = MAX(quantity - %s, 0)
                    WHERE pharmacy_id = %s AND medicine_id = %s
                """, (qty, pharmacy_id, med_id))

        conn.commit()
        return jsonify({"message": "Order placed successfully!", "order_id": order_id}), 201

    except Exception as e:
        conn.rollback()
        print(f"Error placing order: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
