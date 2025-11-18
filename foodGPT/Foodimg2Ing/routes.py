from flask import render_template, url_for, flash, redirect, request, session
from Foodimg2Ing import app
from Foodimg2Ing.output import output
import os

@app.route('/', methods=['GET'])
def home():
    # Clear any previous session data when returning to home
    session.pop('current_recipe', None)
    return render_template('home.html')

@app.route('/about', methods=['GET'])
def about():
    return render_template('about.html')

@app.route('/', methods=['POST', 'GET'])
def predict():
    imagefile = request.files['imagefile']
    image_path = os.path.join(app.root_path, './static/demo_imgs', imagefile.filename)
    imagefile.save(image_path)
    img = "./static/images" + imagefile.filename
    title, ingredients, recipe = output(image_path)
    
    # Store recipe data in session for chat functionality
    session['current_recipe'] = {
        'title': title,
        'ingredients': ingredients,
        'recipe': recipe,
        'img': img
    }
    session.modified = True
    
    return render_template('predict.html', title=title, ingredients=ingredients, recipe=recipe, img=img)

@app.route('/<samplefoodname>')
def predictsample(samplefoodname):
    imagefile = os.path.join(app.root_path, './static/images', str(samplefoodname) + ".jpg")
    img = "/images/" + str(samplefoodname) + ".jpg"
    title, ingredients, recipe = output(imagefile)
    
    # Store recipe data in session for chat functionality
    session['current_recipe'] = {
        'title': title,
        'ingredients': ingredients,
        'recipe': recipe,
        'img': img
    }
    session.modified = True
    
    return render_template('predict.html', title=title, ingredients=ingredients, recipe=recipe, img=img)

@app.route('/chat')
def chat():
    """Route to display chat interface"""
    # Get recipe data from session
    recipe_data = session.get('current_recipe', None)
    
    if not recipe_data:
        # If no recipe in session, redirect to home
        flash('Please identify a recipe first before using the chat feature.', 'warning')
        return redirect(url_for('home'))
    
    # Pass recipe data to chat template
    return render_template('chat.html', 
                         title=recipe_data.get('title', ['']),
                         ingredients=recipe_data.get('ingredients', [[]]),
                         recipe=recipe_data.get('recipe', [[]]),
                         img=recipe_data.get('img', ''))
