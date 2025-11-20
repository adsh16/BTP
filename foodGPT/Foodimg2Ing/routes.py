from flask import request, session, jsonify
from Foodimg2Ing import app
from Foodimg2Ing.output import output
from Foodimg2Ing.auth import require_auth, optional_auth
import os
from werkzeug.utils import secure_filename

def allowed_file(filename):
    """Check if file extension is allowed"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'success',
        'message': 'Dishcovery API is running',
        'version': '2.0.0'
    })

@app.route('/api/recipe/upload', methods=['POST'])
@optional_auth
def upload_recipe(current_user):
    """
    Upload an image and get recipe prediction
    
    Expects: multipart/form-data with 'image' file
    Returns: JSON with recipe data
    """
    try:
        # Check if image file is present
        if 'image' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No image file provided'
            }), 400
        
        imagefile = request.files['image']
        
        # Check if file is selected
        if imagefile.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'No image file selected'
            }), 400
        
        # Validate file type
        if not allowed_file(imagefile.filename):
            return jsonify({
                'status': 'error',
                'message': 'Invalid file type. Allowed: png, jpg, jpeg, gif'
            }), 400
        
        # Save the uploaded image
        filename = secure_filename(imagefile.filename)
        upload_folder = os.path.join(app.root_path, 'static', 'demo_imgs')
        os.makedirs(upload_folder, exist_ok=True)
        
        image_path = os.path.join(upload_folder, filename)
        imagefile.save(image_path)
        
        # Generate recipe using ML model
        title, ingredients, recipe = output(image_path)
        
        # Prepare response data
        recipe_data = {
            'title': title[0] if title else 'Unknown Recipe',
            'ingredients': ingredients[0] if ingredients else [],
            'instructions': recipe[0] if recipe else [],
            'image_url': f'/static/demo_imgs/{filename}'
        }
        
        # Store in session for chat context
        session['current_recipe'] = recipe_data
        if current_user:
            session['user_id'] = current_user.get('uid')
        session.modified = True
        
        return jsonify({
            'status': 'success',
            'data': recipe_data
        })
    
    except Exception as e:
        print(f"Error in upload_recipe: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to process image. Please try again.'
        }), 500

@app.route('/api/recipe/sample/<samplefoodname>', methods=['GET'])
@optional_auth
def get_sample_recipe(samplefoodname, current_user):
    """
    Get recipe for a sample food image
    
    Args:
        samplefoodname: Name of sample image (without extension)
    
    Returns: JSON with recipe data
    """
    try:
        # Construct path to sample image
        imagefile = os.path.join(app.root_path, 'static', 'images', f"{samplefoodname}.jpg")
        
        # Check if file exists
        if not os.path.exists(imagefile):
            return jsonify({
                'status': 'error',
                'message': f'Sample image "{samplefoodname}" not found'
            }), 404
        
        # Generate recipe
        title, ingredients, recipe = output(imagefile)
        
        # Prepare response data
        recipe_data = {
            'title': title[0] if title else 'Unknown Recipe',
            'ingredients': ingredients[0] if ingredients else [],
            'instructions': recipe[0] if recipe else [],
            'image_url': f'/static/images/{samplefoodname}.jpg'
        }
        
        # Store in session
        session['current_recipe'] = recipe_data
        if current_user:
            session['user_id'] = current_user.get('uid')
        session.modified = True
        
        return jsonify({
            'status': 'success',
            'data': recipe_data
        })
    
    except Exception as e:
        print(f"Error in get_sample_recipe: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to process sample image. Please try again.'
        }), 500

@app.route('/api/recipe/current', methods=['GET'])
def get_current_recipe():
    """Get the current recipe from session"""
    recipe_data = session.get('current_recipe')
    
    if not recipe_data:
        return jsonify({
            'status': 'error',
            'message': 'No recipe in session'
        }), 404
    
    return jsonify({
        'status': 'success',
        'data': recipe_data
    })

@app.route('/api/recipe/clear', methods=['DELETE'])
def clear_recipe():
    """Clear current recipe from session"""
    session.pop('current_recipe', None)
    session.modified = True
    
    return jsonify({
        'status': 'success',
        'message': 'Recipe cleared from session'
    })

@app.route('/api/samples', methods=['GET'])
def get_available_samples():
    """Get list of available sample images"""
    try:
        images_path = os.path.join(app.root_path, 'static', 'images')
        
        if not os.path.exists(images_path):
            return jsonify({
                'status': 'success',
                'data': []
            })
        
        # Get all jpg files
        samples = [
            {
                'name': f.replace('.jpg', ''),
                'url': f'/static/images/{f}'
            }
            for f in os.listdir(images_path)
            if f.endswith('.jpg')
        ]
        
        return jsonify({
            'status': 'success',
            'data': samples
        })
    
    except Exception as e:
        print(f"Error getting samples: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to retrieve samples'
        }), 500
