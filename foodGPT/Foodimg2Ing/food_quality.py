import os
import json
import warnings
with warnings.catch_warnings():
    warnings.simplefilter("ignore", FutureWarning)
    import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Use stable vision model
GEMINI_VISION_MODEL = "gemini-2.5-flash"

# Load API key from .env
api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(GEMINI_VISION_MODEL)
    except Exception as e:
        print(f"Error initializing Gemini Vision model: {e}")
        model = None
else:
    print("GEMINI_API_KEY not found in .env")
    model = None

def analyze_food_quality(image_path):
    """
    Analyze food quality from an image using Gemini Vision.
    Returns a dictionary with quality score, rating, and analysis details.
    """
    if not model:
        print("Gemini model not initialized for food quality analysis.")
        return {
            "quality_score": 0,
            "rating": "Unknown",
            "analysis": {
                "freshness": "N/A",
                "texture": "N/A",
                "color_quality": "N/A",
                "cooking_level": "N/A",
                "presentation": "N/A",
                "hygiene_estimate": "N/A"
            },
            "explanation": "Service unavailable. Please check your API key."
        }

    try:
        # Load the image
        img = Image.open(image_path)

        prompt = """
        Analyze the food quality in this image. Evaluate the following parameters:
        1. Freshness of ingredients
        2. Visual spoilage indicators (mold, discoloration)
        3. Texture appearance
        4. Cooking level (undercooked, properly cooked, burnt)
        5. Presentation quality
        6. Estimated hygiene level

        Provide a structured JSON response with the following fields:
        - quality_score: A number between 0 and 100.
        - rating: One of "Excellent" (85-100), "Good" (70-84), "Acceptable" (50-69), "Poor" (30-49), "Unsafe" (0-29).
        - analysis: A dictionary with freshness, texture, color_quality, cooking_level, presentation, hygiene_estimate (each as a descriptive string or short score/status).
        - explanation: A short, readable paragraph (2-3 sentences) explaining the score.

        Return ONLY the JSON.
        """

        response = model.generate_content(
            [prompt, img], 
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.4
            )
        )
        
        # Parse the JSON response
        try:
            result = json.loads(response.text)
            return result
        except json.JSONDecodeError:
            # Fallback if Gemini doesn't return pure JSON
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                print(f"Failed to parse JSON from Gemini response: {response.text}")
                return None

    except Exception as e:
        print(f"Error in analyze_food_quality: {e}")
        return {
            "quality_score": 0,
            "rating": "Error",
            "analysis": {},
            "explanation": f"An error occurred during analysis: {str(e)}"
        }
