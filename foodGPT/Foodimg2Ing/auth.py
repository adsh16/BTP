"""
Firebase Authentication middleware for Dishcovery API
Provides token verification and protected route decorators
"""
from functools import wraps
from flask import request, jsonify
import os

try:
    import firebase_admin
    from firebase_admin import credentials, auth
except ImportError:
    firebase_admin = None
    auth = None

from Foodimg2Ing.config import Config

# Initialize Firebase Admin SDK
_firebase_initialized = False

def init_firebase():
    """Initialize Firebase Admin SDK"""
    global _firebase_initialized
    
    if _firebase_initialized:
        return True
    
    if firebase_admin is None:
        print("Warning: firebase-admin not installed. Authentication disabled.")
        return False
    
    try:
        cred_path = Config.FIREBASE_ADMIN_CREDENTIALS_PATH
        
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            _firebase_initialized = True
            print("Firebase Admin SDK initialized successfully")
            return True
        else:
            print(f"Warning: Firebase credentials file not found at {cred_path}")
            print("Authentication will be disabled. Please add serviceAccountKey.json")
            return False
            
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {e}")
        print("Authentication will be disabled.")
        return False

def verify_firebase_token(id_token):
    """
    Verify Firebase ID token
    
    Args:
        id_token: Firebase ID token from client
        
    Returns:
        dict: Decoded token with user info, or None if invalid
    """
    if not _firebase_initialized or auth is None:
        # For development without Firebase, return a mock user
        return {'uid': 'dev_user', 'email': 'dev@example.com'}
    
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None

def get_token_from_request():
    """
    Extract Firebase token from request headers
    
    Returns:
        str: Token string or None
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return None
    
    # Expected format: "Bearer <token>"
    parts = auth_header.split()
    
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return None
    
    return parts[1]

def require_auth(f):
    """
    Decorator to require Firebase authentication for a route
    
    Usage:
        @app.route('/api/protected')
        @require_auth
        def protected_route(current_user):
            return jsonify({'user': current_user['email']})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_request()
        
        if not token:
            return jsonify({
                'status': 'error',
                'message': 'No authentication token provided'
            }), 401
        
        user = verify_firebase_token(token)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired token'
            }), 401
        
        # Pass user info to the route handler
        return f(current_user=user, *args, **kwargs)
    
    return decorated_function

def optional_auth(f):
    """
    Decorator for routes that work with or without authentication
    Passes None if not authenticated
    
    Usage:
        @app.route('/api/public')
        @optional_auth
        def public_route(current_user):
            if current_user:
                return jsonify({'message': f'Hello {current_user["email"]}'})
            return jsonify({'message': 'Hello guest'})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_request()
        user = None
        
        if token:
            user = verify_firebase_token(token)
        
        return f(current_user=user, *args, **kwargs)
    
    return decorated_function
