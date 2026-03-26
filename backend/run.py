# run.py
import os

from app import create_app

# Create an application instance using our factory
app = create_app()

if __name__ == '__main__':
    # Keep local development convenient while allowing Render to inject PORT.
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=app.config.get('DEBUG', False), host='0.0.0.0', port=port)
