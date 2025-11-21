from flask import Blueprint, request, jsonify, session
import os

try:
    import google.generativeai as genai  # type: ignore
except ImportError:  # pragma: no cover - module availability depends on deployment
    genai = None

llm_chat_bp = Blueprint('llm_chat', __name__)

GEMINI_MODEL = "gemini-2.5-flash"
DEFAULT_GEMINI_KEY = "AIzaSyDKvPGbsuuzq0SYJ4Xf8GVlG1CmEpsHK2s"

if genai is not None:
    try:
        api_key = os.environ.get('GEMINI_API_KEY', DEFAULT_GEMINI_KEY)
        if not api_key or api_key == "[YOUR_GROQ_API_KEY]":
            raise ValueError("Google Gemini API key missing")
        genai.configure(api_key=api_key)
        base_model = genai.GenerativeModel(GEMINI_MODEL)
    except Exception as e:
        print(f"Error initializing Gemini client: {e}")
        base_model = None
else:
    print("google-generativeai package is not installed. Chat functionality disabled.")
    base_model = None

# Store conversation history in session
def get_conversation_history():
    """Get conversation history from session"""
    if 'conversation_history' not in session:
        session['conversation_history'] = []
    return session['conversation_history']

def get_recipe_context():
    """Get the current recipe context from session"""
    if 'recipe_context' not in session:
        session['recipe_context'] = None
    return session['recipe_context']

def set_recipe_context(title, ingredients, recipe):
    """Set the recipe context in session"""
    # Handle the case where title is a list
    recipe_title = title if isinstance(title, str) else (title[0] if title else "Unknown Recipe")
    
    # Handle ingredients - ensure it's a list of strings
    if isinstance(ingredients, list) and len(ingredients) > 0:
        ing_list = ingredients[0] if isinstance(ingredients[0], list) else ingredients
    else:
        ing_list = []
    
    # Handle recipe steps - ensure it's a list of strings
    if isinstance(recipe, list) and len(recipe) > 0:
        recipe_steps = recipe[0] if isinstance(recipe[0], list) else recipe
    else:
        recipe_steps = []
    
    context = f"""You are a helpful cooking assistant. The user has identified the following recipe:

Recipe Name: {recipe_title}

Ingredients:
{', '.join(ing_list)}

Instructions:
{chr(10).join([f"{i+1}. {step}" for i, step in enumerate(recipe_steps)])}

Answer any questions the user has about this recipe. Be helpful, friendly, and provide additional cooking tips when relevant. If asked about substitutions, cooking techniques, or nutritional information, provide accurate and helpful information. Keep your responses concise and practical."""
    
    session['recipe_context'] = context
    session.modified = True
    return context

@llm_chat_bp.route('/chat/init', methods=['POST'])
def init_chat():
    """Initialize chat with recipe context"""
    try:
        data = request.json
        title = data.get('title', '')
        ingredients = data.get('ingredients', [])
        recipe = data.get('recipe', [])
        
        # Set recipe context
        context = set_recipe_context(title, ingredients, recipe)
        
        # Clear previous conversation history
        session['conversation_history'] = []
        session.modified = True
        
        return jsonify({
            'status': 'success',
            'message': 'Chat initialized with recipe context'
        })
    
    except Exception as e:
        print(f"Error initializing chat: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

def _format_history_for_gemini(history):
    """Convert stored history into Gemini-friendly format"""
    formatted = []
    role_map = {'assistant': 'model', 'user': 'user'}
    for msg in history:
        role = role_map.get(msg.get('role', 'user'), 'user')
        content = msg.get('content', '')
        if content:
            formatted.append({
                "role": role,
                "parts": [content]
            })
    return formatted


@llm_chat_bp.route('/chat/message', methods=['POST'])
def chat_message():
    """Handle chat messages"""
    try:
        if not base_model:
            return jsonify({
                'status': 'error',
                'message': 'Chat service is not available. Please check API configuration.'
            }), 500
        
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({
                'status': 'error',
                'message': 'Message is required'
            }), 400
        
        # Get conversation history and recipe context
        conversation_history = get_conversation_history()
        recipe_context = get_recipe_context()
        
        if not recipe_context:
            return jsonify({
                'status': 'error',
                'message': 'No recipe context found. Please identify a recipe first.'
            }), 400
        
        # Build messages for Gemini API
        recent_history = conversation_history[-20:] if len(conversation_history) > 20 else conversation_history
        formatted_history = _format_history_for_gemini(recent_history)
        formatted_history.append({
            "role": "user",
            "parts": [user_message]
        })

        # Instantiate a session-specific model with the recipe context as system instruction
        chat_model = genai.GenerativeModel(
            GEMINI_MODEL,
            system_instruction=recipe_context
        )

        chat_response = chat_model.generate_content(
            formatted_history,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                top_p=0.9,
                max_output_tokens=1024
            )
        )

        assistant_message = (chat_response.text or '').strip()
        
        # Update conversation history
        conversation_history.append({
            "role": "user",
            "content": user_message
        })
        conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })
        
        # Keep only last 20 messages (10 exchanges) to avoid token limits
        if len(conversation_history) > 20:
            conversation_history = conversation_history[-20:]
        
        session['conversation_history'] = conversation_history
        session.modified = True
        
        return jsonify({
            'status': 'success',
            'data': {
                'message': assistant_message
            }
        })
    
    except Exception as e:
        print(f"Error in chat message: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Sorry, I encountered an error processing your message. Please try again.'
        }), 500

@llm_chat_bp.route('/chat/clear', methods=['POST'])
def clear_chat():
    """Clear chat history"""
    try:
        session['conversation_history'] = []
        session.modified = True
        
        return jsonify({
            'status': 'success',
            'message': 'Chat history cleared'
        })
    
    except Exception as e:
        print(f"Error clearing chat: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@llm_chat_bp.route('/chat/suggestions', methods=['GET'])
def get_suggestions():
    """Get suggested questions based on recipe"""
    try:
        suggestions = [
            "What are some possible ingredient substitutions?",
            "How can I make this recipe healthier?",
            "What side dishes would pair well with this?",
            "Can you suggest cooking tips for beginners?",
            "What's the estimated cooking time?",
            "How many servings does this recipe make?",
            "What kitchen equipment do I need?",
            "Can I prepare this ahead of time?"
        ]
        
        return jsonify({
            'status': 'success',
            'suggestions': suggestions
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
