"""
Configuration management for Dishcovery API
Handles environment variables and settings for Flask app, Firebase, and external APIs
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here-change-in-production'
    
    # Flask settings
    SESSION_TYPE = 'filesystem'
    
    # CORS settings
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # Firebase Admin SDK
    FIREBASE_ADMIN_CREDENTIALS_PATH = os.environ.get(
        'FIREBASE_ADMIN_CREDENTIALS_PATH',
        './serviceAccountKey.json'
    )
    
    # Gemini API
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'AIzaSyDKvPGbsuuzq0SYJ4Xf8GVlG1CmEpsHK2s')
    GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')
    
    # Upload settings
    UPLOAD_FOLDER = './static/demo_imgs'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
    # ML Model settings
    MODEL_DATA_PATH = './data'
    
    @staticmethod
    def init_app(app):
        """Initialize app with configuration"""
        pass

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    FLASK_ENV = 'development'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    FLASK_ENV = 'production'

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
