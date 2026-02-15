from flask import request, session, jsonify
from Foodimg2Ing import app
from Foodimg2Ing.output import output
from Foodimg2Ing.auth import require_auth, optional_auth
from Foodimg2Ing.llm_chat import set_recipe_context
import os
from werkzeug.utils import secure_filename


# -------------------------
# Utility
# -------------------------

def allowed_file(filename):
    """Check if file extension is allowed"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# -------------------------
# Health Check
# -------------------------

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'success',
        'message': 'Dishcovery API is running',
        'version': '2.0.0'
    })


# -------------------------
# Upload Recipe Image
# -------------------------

@app.route('/api/recipe/upload', methods=['POST'])
@optional_auth
def upload_recipe(current_user):
    """
    Upload an image and get recipe prediction
    """
    try:
        if 'image' not in request.files:
            return jsonify({'status': 'error', 'message': 'No image file provided'}), 400

        imagefile = request.files['image']

        if imagefile.filename == '':
            return jsonify({'status': 'error', 'message': 'No image file selected'}), 400

        if not allowed_file(imagefile.filename):
            return jsonify({'status': 'error', 'message': 'Invalid file type'}), 400

        # Save image
        filename = secure_filename(imagefile.filename)
        upload_folder = os.path.join(app.root_path, 'static', 'demo_imgs')
        os.makedirs(upload_folder, exist_ok=True)

        image_path = os.path.join(upload_folder, filename)
        imagefile.save(image_path)

        # Run ML model
        title, ingredients, recipe = output(image_path)

        recipe_data = {
            'title': title[0] if title else 'Unknown Recipe',
            'ingredients': ingredients[0] if ingredients else [],
            'instructions': recipe[0] if recipe else [],
            'image_url': f'/static/demo_imgs/{filename}'
        }

        # Store recipe in session
        session['current_recipe'] = recipe_data

        # 🔥 Initialize Gemini chat context
        set_recipe_context(title, ingredients, recipe)
        session['conversation_history'] = []

        if current_user:
            session['user_id'] = current_user.get('uid')

        session.modified = True

        return jsonify({'status': 'success', 'data': recipe_data})

    except Exception as e:
        print(f"Error in upload_recipe: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to process image'}), 500


# -------------------------
# Sample Recipe
# -------------------------

@app.route('/api/recipe/sample/<samplefoodname>', methods=['GET'])
@optional_auth
def get_sample_recipe(samplefoodname, current_user):
    """Get recipe for a sample image"""
    try:
        imagefile = os.path.join(app.root_path, 'static', 'images', f"{samplefoodname}.jpg")

        if not os.path.exists(imagefile):
            return jsonify({'status': 'error', 'message': 'Sample image not found'}), 404

        title, ingredients, recipe = output(imagefile)

        recipe_data = {
            'title': title[0] if title else 'Unknown Recipe',
            'ingredients': ingredients[0] if ingredients else [],
            'instructions': recipe[0] if recipe else [],
            'image_url': f'/static/images/{samplefoodname}.jpg'
        }

        session['current_recipe'] = recipe_data

        # 🔥 Initialize Gemini chat context
        set_recipe_context(title, ingredients, recipe)
        session['conversation_history'] = []

        if current_user:
            session['user_id'] = current_user.get('uid')

        session.modified = True

        return jsonify({'status': 'success', 'data': recipe_data})

    except Exception as e:
        print(f"Error in get_sample_recipe: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to process sample'}), 500


# -------------------------
# Get Current Recipe
# -------------------------

@app.route('/api/recipe/current', methods=['GET'])
def get_current_recipe():
    recipe_data = session.get('current_recipe')

    if not recipe_data:
        return jsonify({'status': 'error', 'message': 'No recipe in session'}), 404

    return jsonify({'status': 'success', 'data': recipe_data})


# -------------------------
# Clear Recipe
# -------------------------

@app.route('/api/recipe/clear', methods=['DELETE'])
def clear_recipe():
    session.pop('current_recipe', None)
    session.pop('recipe_context', None)
    session.pop('conversation_history', None)
    session.modified = True

    return jsonify({'status': 'success', 'message': 'Recipe cleared'})


# -------------------------
# Get Available Samples
# -------------------------

@app.route('/api/samples', methods=['GET'])
def get_available_samples():
    try:
        images_path = os.path.join(app.root_path, 'static', 'images')

        if not os.path.exists(images_path):
            return jsonify({'status': 'success', 'data': []})

        samples = [
            {'name': f.replace('.jpg', ''), 'url': f'/static/images/{f}'}
            for f in os.listdir(images_path)
            if f.endswith('.jpg')
        ]

        return jsonify({'status': 'success', 'data': samples})

    except Exception as e:
        print(f"Error getting samples: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to retrieve samples'}), 500
