from flask import Flask
from flask_cors import CORS
import os

app = Flask(__name__)

# Load configuration
from Foodimg2Ing.config import config
config_name = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config[config_name])

# Initialize CORS
CORS(app, resources={
    r"/api/*": {
        "origins": app.config['CORS_ORIGINS'],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize Firebase Admin SDK
from Foodimg2Ing.auth import init_firebase
init_firebase()

# Register blueprints
from Foodimg2Ing.llm_chat import llm_chat_bp
app.register_blueprint(llm_chat_bp, url_prefix='/api')

# Import routes
from Foodimg2Ing import routes
