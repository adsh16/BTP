# BTP
# FoodGPT/DishCovery/FoodGenie
- Dishcovery: A end-to-end VQA(Visual Question Answering) model for Food Images
code files and relevant things related to btp

# Poster
![BTP Poster](./poster/btp%20poster.png)

# References

[ExacliDraw Road Map](https://excalidraw.com/#room=f5b932d66db926c2c44e,jdwk_7GHJ5otTKs64UHcUg)

## Dish Identification
- **[Food-101](https://data.vision.ee.ethz.ch/cvl/datasets_extra/food-101/)**  
  Contains 101,000 images across 101 categories. This dataset is widely used for food recognition and will serve as the base for identifying dishes and their categories in the project.

- **[Recipe1M+](https://im2recipe.csail.mit.edu/)**  
  A large-scale dataset that pairs recipes with corresponding images. It helps in learning joint embeddings of text and images, which improves the accuracy and confidence of dish and cuisine identification.

## 🔬 Vision Pipeline: Model & Dataset Mapping

This table breaks down the four custom-trained vision modules that act as the "specialist tools" for the FoodGPT reasoning engine.

| Project Module | Dataset | Model Architecture | Model Task |
| :--- | :--- | :--- | :--- |
| **1. Dish Classification** | `Food-101` | Vision Transformer (ViT) / EfficientNet | Multi-Class Classification |
| **2. Food Quality** | `Fresh/Spoiled (Kaggle)` | ResNet50 / EfficientNet | Binary/Multi-Class Classification |
| **3. Ingredient Detection**| `FoodSeg103` | Mask R-CNN / Segment Anything (SAM) | Instance Segmentation |
| **4. Nutrition Estimation**| `Nutrition5k` | Multi-Modal MLP / Transformer | Regression |

---

## Sample Workflow

## Proposed Unified Architecture: A "Vision-Augmented" LLM

Think of it this way: instead of training one giant model to answer "Is this healthy?", you will:

1.  **Train specialist models (your "Vision Toolkit")** to analyze the image and output structured data.
2.  **Feed this structured data to an LLM (your "Reasoning Engine")** which then answers the user's natural language question.

Here’s a visual representation of this combined flow:

**Input:** `Image of Paella` + `Query : "Is this a healthy option for a low-carb diet?"`

---

### Stage 1: The Vision Analysis Pipeline (Your "Tools")

The image is fed in parallel to all the specialist models you plan to build.

**Dish ID Model (trained on Food-101/Recipe1M+)**
* **Output:** `{"dish": "Paella", "confidence": 0.92, "cuisine": "Spanish"}`

**Ingredient Seg. Model (trained on FoodSeg103)**
* **Output:** `{"ingredients_detected": ["rice", "shrimp", "mussels", "peas", "lemon_wedge"]}`

**Quality Model (trained on Kaggle dataset)**
* **Output:** `{"quality": "Fresh", "score": 0.98}`

**Nutrition Model (trained on Nutrition5k)**
* **Output:** `{"estimated_calories": 450, "protein_g": 22, "carbs_g": 55, "fat_g": 15}`

---

### Stage 2: The LLM Reasoning Engine (Your "Brain")

All the structured data from Stage 1 is compiled into a single "context" string (e.g., a JSON or formatted text) and inserted into a prompt for a central LLM.

**User Query:** "Is this a healthy option for a low-carb diet?"

**Internal LLM Prompt (simplified):**

SYSTEM: You are FoodGPT, a helpful assistant.
Use the following vision analysis and web context to answer the user's question.

**VISION ANALYSIS**
```json
{
  "dish": "Paella",
  "confidence": 0.92,
  "cuisine": "Spanish",
  "ingredients_detected": ["rice", "shrimp", "mussels", "peas", "lemon_wedge"],
  "quality": "Fresh",
  "estimated_calories": 450,
  "protein_g": 22,
  "carbs_g": 55,
  "fat_g": 15
}
```

### Additional Models

| Project Module | Dataset | Model Architecture | Model Task |
| :--- | :--- | :--- | :--- |
| **Recipe Context** | `Recipe1M+` | Dual-Encoder (CLIP-style) | Joint Text-Image Embedding |
| **Central VQA Brain** | `WorldCuisines` | Multi-modal LLM (LLaVA-style) | Generative Question Answering |

## Food Quality
- **[Fresh and Spoiled Food Image Dataset (Kaggle)](https://www.kaggle.com/datasets/maheen00shahid/fresh-and-spoiled-food-image-dataset/data?select=dataset)**  
  A labeled dataset of fresh and spoiled food images. It will be used to train models that can distinguish between good and poor-quality food. Since it only contains images, the model will be trained using convolutional neural networks or hybrid vision architectures.  
  For cooked or prepared dishes, the dataset will be supplemented with additional curated examples and data augmentation to better capture real-world food quality conditions.
## WorkFlow Diagram
<img width="1400" height="1600" alt="svgviewer-output" src="https://github.com/user-attachments/assets/42787172-903b-472c-b360-181b884129ac" />



## Architecture

### High-Level Pipeline
```
Input Image → CNN Encoder → Ingredient Decoder → Recipe Decoder → Output Recipe
                ↓                   ↓                    ↓
         Image Features      Ingredients List    Cooking Instructions
```

### Component Breakdown

#### 1. **Image Encoder (EncoderCNN)**
- **Base Model**: Pre-trained ResNet-50/101 (trained on ImageNet by team Pytorch)
- **Purpose**: Extract visual features from food images (This will help us in getting the notion of the dish from the image)
- **Output**: 512-dimensional feature vectors
- **Key Operations**:
  - Removes final classification layers
  - Applies 1×1 convolution for dimension projection

#### 2. **Ingredient Decoder (Transformer)**
- **Architecture**: 4-layer transformer with 4 attention heads
- **Input**: Image features from CNN encoder
- **Output**: Predicted ingredient list
- **Special Features**:
  - Since ingredient order doesn't matter we inherits no positional embeddings
  - End of Sequence prediction for variable-length lists
  - We ensure that each ingredient is predicted once by implementing non replacement sampling

#### 3. **Recipe Decoder (Transformer)**
- **Architecture**: 16-layer transformer with 8 attention heads
- **Input**: Image features + predicted ingredients
- **Output**: Sequential cooking instructions
- **Special Features**:
  - Autoregressive generation with causal masking
  - Positional embeddings for instruction ordering
  - Cross-attention to both image and ingredient representations
