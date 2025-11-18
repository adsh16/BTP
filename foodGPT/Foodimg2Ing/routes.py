# from flask import Flask, render_template, request, session, url_for, redirect
# from .llm_chat import llm_chat_bp
# import os

# app = Flask(__name__)
# app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
# app.register_blueprint(llm_chat_bp)

# @app.route('/',methods=['GET'])
# def home():
#     return render_template('home.html')
# @app.route('/about',methods=['GET'])
# def about():
#     return render_template('about.html')
# @app.route('/chat')
# def chat_page():
#     recipe_index = int(request.args.get('recipe_index', 0))
#     recipe_data = session.get('recipe_data', None)
    
#     if not recipe_data:
#         return redirect(url_for('home'))
    
#     titles = recipe_data.get('titles', ['No Recipe', 'No Recipe'])
#     ingredients = recipe_data.get('ingredients', [[], []])
#     recipes = recipe_data.get('recipes', [[], []])
    
#     selected_title = titles[recipe_index] if recipe_index < len(titles) else 'No Recipe'
#     selected_ingredients = ingredients[recipe_index] if recipe_index < len(ingredients) else []
#     selected_recipe = recipes[recipe_index] if recipe_index < len(recipes) else []
    
#     return render_template('chat.html', 
#                           title=[selected_title],
#                           ingredients=[selected_ingredients], 
#                           recipe=[selected_recipe])
    
# @app.route('/',methods=['POST','GET'])
# def predict():
#     imagefile=request.files['imagefile']
#     image_path=os.path.join(app.root_path,'./static/demo_imgs',imagefile.filename)
#     imagefile.save(image_path)
#     img="./static/images"+imagefile.filename
#     title,ingredients,recipe = output(image_path)
#     return render_template('predict.html',title=title,ingredients=ingredients,recipe=recipe,img=img)

# @app.route('/chat')
# def chat_page():
#     recipe_index = int(request.args.get('recipe_index', 0))
#     recipe_data = session.get('recipe_data', None)
    
#     if not recipe_data:
#         return redirect(url_for('home'))
    
#     titles = recipe_data.get('titles', ['No Recipe', 'No Recipe'])
#     ingredients = recipe_data.get('ingredients', [[], []])
#     recipes = recipe_data.get('recipes', [[], []])
    
#     selected_title = titles[recipe_index] if recipe_index < len(titles) else 'No Recipe'
#     selected_ingredients = ingredients[recipe_index] if recipe_index < len(ingredients) else []
#     selected_recipe = recipes[recipe_index] if recipe_index < len(recipes) else []
    
#     return render_template('chat.html', 
#                           title=[selected_title],
#                           ingredients=[selected_ingredients], 
#                           recipe=[selected_recipe])

# if __name__ == '__main__':
#     app.run(debug=True)
    
    
from flask import render_template ,url_for,flash,redirect,request
from Foodimg2Ing import app
from Foodimg2Ing.output import output
import os
@app.route('/',methods=['GET'])
def home():
    return render_template('home.html')
@app.route('/about',methods=['GET'])
def about():
    return render_template('about.html')
@app.route('/',methods=['POST','GET'])
def predict():
    imagefile=request.files['imagefile']
    image_path=os.path.join(app.root_path,'./static/demo_imgs',imagefile.filename)
    imagefile.save(image_path)
    img="./static/images"+imagefile.filename
    title,ingredients,recipe = output(image_path)
    return render_template('predict.html',title=title,ingredients=ingredients,recipe=recipe,img=img)
@app.route('/<samplefoodname>')
def predictsample(samplefoodname):
    imagefile=os.path.join(app.root_path,'./static/images',str(samplefoodname)+".jpg")
    img="/images/"+str(samplefoodname)+".jpg"
    title,ingredients,recipe = output(imagefile)
    return render_template('predict.html',title=title,ingredients=ingredients,recipe=recipe,img=img)
