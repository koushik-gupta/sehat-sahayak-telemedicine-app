import os

from flask import current_app


def get_upload_folder():
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    return upload_folder


def relative_upload_url(filename):
    return f"/uploads/{filename}"


def public_url_for_path(path):
    if not path:
        return path
    if path.startswith(('http://', 'https://', 'data:', 'blob:')):
        return path

    public_backend_url = current_app.config.get('PUBLIC_BACKEND_URL', '').rstrip('/')
    if public_backend_url and path.startswith('/'):
        return f"{public_backend_url}{path}"

    return path


def build_public_upload_url(filename):
    return public_url_for_path(relative_upload_url(filename))
