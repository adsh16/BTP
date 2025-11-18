from flask import Flask

app = Flask(__name__, template_folder='Templates')

app.config['SECRET_KEY'] = 'your-secret-key-here-change-in-production'
app.config['SESSION_TYPE'] = 'filesystem'

from Foodimg2Ing.llm_chat import llm_chat_bp
app.register_blueprint(llm_chat_bp)

from Foodimg2Ing import routes
