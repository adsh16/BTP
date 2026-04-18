import os
import time
from dotenv import load_dotenv
from flask import Blueprint, jsonify, request, session

# Load environment variables
load_dotenv()

try:
    import google.generativeai as genai
except ImportError:
    genai = None


llm_chat_bp = Blueprint("llm_chat", __name__)

GEMINI_MODEL = "gemini-2.5-flash"

api_key = os.getenv("GEMINI_API_KEY")

# -----------------------------
# Gemini Initialization
# -----------------------------
if genai is not None:
    try:
        if not api_key:
            raise ValueError("Gemini API key not found in .env")

        genai.configure(api_key=api_key)

        # Reuse single model instance
        base_model = genai.GenerativeModel(GEMINI_MODEL)

    except Exception as e:
        print(f"Error initializing Gemini client: {e}")
        base_model = None
else:
    print("google-generativeai package not installed.")
    base_model = None


# -----------------------------
# Rate Limiting
# -----------------------------
last_request_time = 0
REQUEST_DELAY = 10  # seconds


# -----------------------------
# Session Helpers
# -----------------------------
def get_conversation_history():
    if "conversation_history" not in session:
        session["conversation_history"] = []
    return session["conversation_history"]


def get_recipe_context():
    return session.get("recipe_context")


def set_recipe_context(title, ingredients, recipe):

    recipe_title = (
        title if isinstance(title, str) else (title[0] if title else "Unknown Recipe")
    )

    if isinstance(ingredients, list) and len(ingredients) > 0:
        ing_list = ingredients[0] if isinstance(ingredients[0], list) else ingredients
    else:
        ing_list = []

    if isinstance(recipe, list) and len(recipe) > 0:
        recipe_steps = recipe[0] if isinstance(recipe[0], list) else recipe
    else:
        recipe_steps = []

    context = f"""
You are a helpful cooking assistant.

Recipe Name: {recipe_title}

Ingredients:
{", ".join(ing_list)}

Instructions:
{chr(10).join([f"{i + 1}. {step}" for i, step in enumerate(recipe_steps)])}

Answer questions about this recipe. Provide:
- cooking tips
- ingredient substitutions
- nutrition estimates when possible
- concise helpful explanations.
"""

    session["recipe_context"] = context
    session.modified = True

    return context


# -----------------------------
# Chat Initialization
# -----------------------------
@llm_chat_bp.route("/chat/init", methods=["POST"])
def init_chat():
    try:
        data = request.json

        title = data.get("title", "")
        ingredients = data.get("ingredients", [])
        recipe = data.get("recipe", [])

        set_recipe_context(title, ingredients, recipe)

        session["conversation_history"] = []
        session.modified = True

        return jsonify(
            {"status": "success", "message": "Chat initialized with recipe context"}
        )

    except Exception as e:
        print("Chat init error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500


# -----------------------------
# Chat Message
# -----------------------------
@llm_chat_bp.route("/chat/message", methods=["POST"])
def chat_message():

    global last_request_time

    try:
        if base_model is None:
            return jsonify(
                {"status": "error", "message": "Gemini service not available"}
            ), 500

        data = request.json
        user_message = data.get("message")

        if not user_message:
            return jsonify({"status": "error", "message": "Message is required"}), 400

        conversation_history = get_conversation_history()
        recipe_context = get_recipe_context()

        if not recipe_context:
            return jsonify(
                {"status": "error", "message": "No recipe context found"}
            ), 400

        # -----------------------------
        # Rate Limiting
        # -----------------------------
        current_time = time.time()
        if current_time - last_request_time < REQUEST_DELAY:
            time.sleep(REQUEST_DELAY)

        last_request_time = time.time()

        # -----------------------------
        # Build Prompt
        # -----------------------------
        recent_history = conversation_history[-10:]

        history_text = "\n".join(
            [f"{msg['role']}: {msg['content']}" for msg in recent_history]
        )

        full_prompt = f"""
{recipe_context}

Conversation History:
{history_text}

User: {user_message}

Answer clearly and concisely.
"""

        print("User message:", user_message)

        # -----------------------------
        # Call Gemini (single call)
        # -----------------------------
        try:
            response = base_model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_p=0.9,
                    max_output_tokens=1024,
                ),
            )
        except Exception as e:
            print("Gemini API error:", e)
            return jsonify(
                {
                    "status": "error",
                    "message": "Rate limit hit. Please wait a few seconds.",
                }
            ), 429

        # -----------------------------
        # Parse Response
        # -----------------------------
        assistant_message = ""

        try:
            if hasattr(response, "text") and response.text:
                assistant_message = response.text.strip()
            else:
                assistant_message = (
                    response.candidates[0].content.parts[0].text.strip()
                )
        except Exception as e:
            print("Parse error:", e)
            assistant_message = "Sorry, I couldn't generate a response."

        if not assistant_message:
            assistant_message = "I'm sorry, I couldn't generate a response."

        # -----------------------------
        # Save History
        # -----------------------------
        conversation_history.append({"role": "user", "content": user_message})
        conversation_history.append(
            {"role": "assistant", "content": assistant_message}
        )

        session["conversation_history"] = conversation_history[-10:]
        session.modified = True

        return jsonify({"status": "success", "data": {"message": assistant_message}})

    except Exception as e:
        import traceback

        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500


# -----------------------------
# Clear Chat
# -----------------------------
@llm_chat_bp.route("/chat/clear", methods=["POST"])
def clear_chat():
    try:
        session["conversation_history"] = []
        session.modified = True

        return jsonify({"status": "success", "message": "Chat history cleared"})

    except Exception as e:
        print("Clear chat error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500


# -----------------------------
# Suggestions
# -----------------------------
@llm_chat_bp.route("/chat/suggestions", methods=["GET"])
def get_suggestions():

    suggestions = [
        "What are some ingredient substitutions?",
        "How can I make this recipe healthier?",
        "What side dishes pair well with this?",
        "Any cooking tips for beginners?",
        "What is the estimated cooking time?",
        "How many servings does this make?",
        "What equipment do I need?",
        "Can this be prepared ahead of time?",
    ]

    return jsonify({"status": "success", "suggestions": suggestions})