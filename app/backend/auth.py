import os
import secrets
import hashlib
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv

load_dotenv()

# Generate a secure API key if not exists
def generate_api_key():
    """Generate a secure API key"""
    return secrets.token_urlsafe(32)

def get_api_key():
    """Get API key from environment or generate one"""
    api_key = os.getenv("APP_API_KEY")
    if not api_key:
        # Generate and save to .env file
        api_key = generate_api_key()
        with open('.env', 'a') as f:
            f.write(f'\nAPP_API_KEY={api_key}\n')
        print(f"Generated new API key: {api_key}")
    return api_key

def hash_api_key(api_key):
    """Hash the API key for secure comparison"""
    return hashlib.sha256(api_key.encode()).hexdigest()

def require_api_key(f):
    """Decorator to require valid API key"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get API key from request headers
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return jsonify({"error": "API key required"}), 401
        
        # Get the expected API key
        expected_api_key = get_api_key()
        
        # Compare hashed values for security
        if hash_api_key(api_key) != hash_api_key(expected_api_key):
            return jsonify({"error": "Invalid API key"}), 401
        
        return f(*args, **kwargs)
    return decorated_function

def validate_api_key(api_key):
    """Validate if the provided API key is correct"""
    expected_api_key = get_api_key()
    return hash_api_key(api_key) == hash_api_key(expected_api_key) 