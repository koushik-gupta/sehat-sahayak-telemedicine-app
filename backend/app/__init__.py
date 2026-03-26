# app/__init__.py

import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
from .config import Config
from .db_utils import initialize_database
from .sockets import sock # Import the sock instance from our new sockets.py file

def create_app(config_class=Config):
    """
    Application factory function. Now includes initialization for WebSockets
    and registers all new blueprints for the consultation feature.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
    
    # --- Initialize Extensions ---
    cors_origins = app.config.get('CORS_ORIGINS') or []
    CORS(
        app,
        supports_credentials=True,
        resources={
            r"/api/*": {"origins": cors_origins},
            r"/uploads/*": {"origins": cors_origins},
        },
    )
    sock.init_app(app) # Initialize Flask-Sock to enable WebSocket routes
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    with app.app_context():
        initialize_database()
    
    # --- Import and Register All API Blueprints ---
    from .api.v1.auth.routes import auth_bp
    app.register_blueprint(auth_bp)
    
    from .api.v1.admin.routes import admin_bp
    app.register_blueprint(admin_bp)

    from .api.v1.user.routes import user_bp
    app.register_blueprint(user_bp)
    
    from .api.v1.chatbot.routes import chatbot_bp
    app.register_blueprint(chatbot_bp)

    from .api.v1.patient.routes import patient_bp
    app.register_blueprint(patient_bp)
    
    # --- NEW BLUEPRINTS FOR VIDEO CONSULTATION ---
    from .api.v1.doctor.routes import doctor_bp
    app.register_blueprint(doctor_bp)
    
    from .api.v1.appointment.routes import appointment_bp
    app.register_blueprint(appointment_bp)

    # ==============================================================================
    # =========================== THIS IS THE FINAL STEP ===========================
    # Register the new Pharmacy blueprint to make its API routes active.
    from .api.v1.pharmacy.routes import pharmacy_bp
    app.register_blueprint(pharmacy_bp)
    # ==============================================================================

    # --- Route to Serve Uploaded Files ---
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    return app
