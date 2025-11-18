from flask import Blueprint, request, jsonify, session
import os
from groq import Groq

llm_chat_bp = Blueprint('llm_chat', __name__)

try:
    api_key = os.environ.get('GROQ_API_KEY', '[YOUR_GROQ_API_KEY]')
    client = Groq(api_key=api_key)
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    client = None

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

@llm_chat_bp.route('/api/chat/init', methods=['POST'])
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

@llm_chat_bp.route('/api/chat/message', methods=['POST'])
def chat_message():
    """Handle chat messages"""
    try:
        if not client:
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
        
        # Build messages for Groq API
        messages = [
            {
                "role": "system",
                "content": recipe_context
            }
        ]
        
        # Add conversation history (last 10 exchanges to avoid token limits)
        recent_history = conversation_history[-20:] if len(conversation_history) > 20 else conversation_history
        for msg in recent_history:
            messages.append(msg)
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",  # Fast and accurate model
            temperature=0.7,
            max_tokens=1024,
            top_p=0.9,
        )
        
        # Get assistant response
        assistant_message = chat_completion.choices[0].message.content
        
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
            'message': assistant_message
        })
    
    except Exception as e:
        print(f"Error in chat message: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Sorry, I encountered an error processing your message. Please try again.'
        }), 500

@llm_chat_bp.route('/api/chat/clear', methods=['POST'])
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

@llm_chat_bp.route('/api/chat/suggestions', methods=['GET'])
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
