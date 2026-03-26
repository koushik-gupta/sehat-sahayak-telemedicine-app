# app/api/v1/patient/routes.py

import os
import requests
from flask import Blueprint, request, jsonify

from ..auth.utils import login_required

patient_bp = Blueprint('patient_bp', __name__, url_prefix='/api/v1/patient')

@patient_bp.route('/nearby-hospitals', methods=['POST'])
@login_required
def get_nearby_hospitals(current_user):
    data = request.get_json()
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')

    if not api_key:
        return jsonify({"error": "Server configuration error: API key is missing."}), 500
        
    if not data or ('address' not in data and ('latitude' not in data or 'longitude' not in data)):
        return jsonify({"error": "Address or coordinates are required."}), 400

    lat, lng, location_name = None, None, None

    # Step 1: Geocode or Reverse Geocode to get coordinates and a display name
    if 'address' in data:
        geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
        geocode_params = {"address": data['address'], "key": api_key}
        geocode_resp = requests.get(geocode_url, params=geocode_params)
        geocode_data = geocode_resp.json()

        if geocode_data['status'] != 'OK' or not geocode_data['results']:
            return jsonify({"error": f"Could not find location: {data['address']}"}), 404
        
        location = geocode_data['results'][0]['geometry']['location']
        lat, lng = location['lat'], location['lng']
        location_name = geocode_data['results'][0]['formatted_address']
    else:
        lat, lng = data['latitude'], data['longitude']
        
        # NEW: Reverse geocode the coordinates to get the address
        geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
        geocode_params = {"latlng": f"{lat},{lng}", "key": api_key}
        geocode_resp = requests.get(geocode_url, params=geocode_params)
        geocode_data = geocode_resp.json()
        
        if geocode_data['status'] == 'OK' and geocode_data['results']:
            location_name = geocode_data['results'][0]['formatted_address']
        else:
            location_name = "your current location"

    # Step 2: Find Nearby Hospitals using Places API
    places_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    places_params = {
        "location": f"{lat},{lng}", "radius": 50000, "type": "hospital", "key": api_key
    }
    places_resp = requests.get(places_url, params=places_params)
    places_data = places_resp.json()

    if places_data['status'] != 'OK':
        return jsonify({"error": "Failed to fetch nearby hospitals from Google Places."}), 500

    hospitals = places_data.get('results', [])
    if not hospitals:
        return jsonify({"message": f"No hospitals found near {location_name}", "hospitals": []}), 200

    # Step 3: Calculate Distances using Distance Matrix API
    destinations = "|".join([f"{h['geometry']['location']['lat']},{h['geometry']['location']['lng']}" for h in hospitals])
    dist_url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    dist_params = {"origins": f"{lat},{lng}", "destinations": destinations, "key": api_key}
    dist_resp = requests.get(dist_url, params=dist_params)
    dist_data = dist_resp.json()

    # Step 4: Combine, Get Phone Numbers, and Format Results
    final_results = []
    distance_elements = dist_data['rows'][0]['elements'] if dist_data.get('rows') else []

    for i, hospital in enumerate(hospitals):
        phone_number = None
        place_id = hospital.get('place_id')
        if place_id:
            details_url = "https://maps.googleapis.com/maps/api/place/details/json"
            details_params = {"place_id": place_id, "fields": "international_phone_number", "key": api_key}
            details_resp = requests.get(details_url, params=details_params)
            details_data = details_resp.json()
            if details_data['status'] == 'OK':
                phone_number = details_data.get('result', {}).get('international_phone_number')

        distance_info = distance_elements[i] if i < len(distance_elements) else {}
        
        def classify_hospital(name):
            gov_keywords = ['government', 'govt', 'state', 'municipal', 'public', 'district', 'aiims', 'medical college']
            return 'Government' if any(k in name.lower() for k in gov_keywords) else 'Private'

        final_results.append({
            "id": place_id, "name": hospital.get('name', 'Unnamed Hospital'),
            "address": hospital.get('vicinity', 'Address not available'),
            "type": classify_hospital(hospital.get('name', '')),
            "distanceText": distance_info.get('distance', {}).get('text', 'N/A'),
            "distanceValue": distance_info.get('distance', {}).get('value', float('inf')),
            "phone": phone_number
        })

    final_results.sort(key=lambda x: x['distanceValue'])
    
    return jsonify({"hospitals": final_results, "searchedLocation": location_name}), 200