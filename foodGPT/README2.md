# Dishcovery - AI-Powered Recipe Generation from Food Images

![Python](https://img.shields.io/badge/python-3.7+-blue.svg)
![PyTorch](https://img.shields.io/badge/PyTorch-1.7+-ee4c2c.svg)
![Flask](https://img.shields.io/badge/Flask-2.0+-000000.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Dishcovery is a deep learning web application that generates complete recipes (ingredients and cooking instructions) from food images. Built using transformer-based architecture and deployed with Flask, this project makes state-of-the-art inverse cooking technology accessible through an intuitive web interface.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Model Details](#model-details)
- [Workflow](#workflow)
- [Technologies Used](#technologies-used)
- [Limitations](#limitations)
- [Acknowledgments](#acknowledgments)
- [License](#license)

## Overview

Have you ever seen a delicious dish and wondered what ingredients and steps went into making it? Dishcovery solves this problem by analyzing food images and automatically generating:

- ✅ Complete ingredient lists
- ✅ Step-by-step cooking instructions
- ✅ Recipe titles

The system uses a two-stage transformer-based architecture trained on the Recipe1M dataset, combining computer vision and natural language generation.

## Features

- **Image-to-Recipe Generation**: Upload any food image and get a complete recipe
- **Dual Generation Modes**: 
  - Greedy sampling for deterministic results
  - Temperature sampling for diverse outputs
- **Pre-loaded Examples**: Try the model on sample food images
- **Web-based Interface**: User-friendly Flask application
- **Real-time Inference**: Get results in seconds
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

### High-Level Pipeline

```
Input Image → CNN Encoder → Ingredient Decoder → Recipe Decoder → Output Recipe
                ↓                   ↓                    ↓
         Image Features      Ingredients List    Cooking Instructions
```

### Component Breakdown

#### 1. **Image Encoder (EncoderCNN)**
- **Base Model**: Pre-trained ResNet-50/101 (trained on ImageNet)
- **Purpose**: Extract visual features from food images
- **Output**: 512-dimensional feature vectors
- **Key Operations**:
  - Removes final classification layers
  - Applies 1×1 convolution for dimension projection
  - Optional gradient freezing for efficient inference

#### 2. **Ingredient Decoder (Transformer)**
- **Architecture**: 4-layer transformer with 4 attention heads
- **Input**: Image features from CNN encoder
- **Output**: Predicted ingredient list
- **Special Features**:
  - No positional embeddings (ingredient order doesn't matter)
  - EOS (End-of-Sequence) prediction for variable-length lists
  - Non-replacement sampling (each ingredient predicted once)

#### 3. **Recipe Decoder (Transformer)**
- **Architecture**: 16-layer transformer with 8 attention heads
- **Input**: Image features + predicted ingredients
- **Output**: Sequential cooking instructions
- **Special Features**:
  - Autoregressive generation with causal masking
  - Positional embeddings for instruction ordering
  - Cross-attention to both image and ingredient representations

## Installation

### Prerequisites

```bash
Python 3.7+
CUDA 10.2+ (optional, for GPU support)
```

### Step 1: Clone the Repository

```bash
git clone https://github.com/akshatrajsaxena/dishcovery.git
cd dishcovery
```

### Step 2: Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

**requirements.txt:**
```
torch>=1.7.0
torchvision>=0.8.0
flask>=2.0.0
numpy>=1.19.0
pillow>=8.0.0
tensorflow>=2.4.0
matplotlib>=3.3.0
```

### Step 4: Download Pre-trained Models & Data

Download the required files and place them in the `data/` directory:

- `modelbest.ckpt` - Pre-trained inverse cooking model weights

```bash
mkdir -p Foodimg2Ing/data
# Place downloaded files in Foodimg2Ing/data/
```

**Note**: These files must be obtained from the original [Inverse Cooking repository](https://github.com/facebookresearch/inversecooking) or trained yourself.

### Step 5: Run the Application

```bash
python run.py
```

Visit `http://localhost:5000` in your browser.

## Usage

### Web Interface

1. **Home Page**: Navigate to the landing page
2. **Upload Image**: Click "Choose File" and select a food image
3. **Generate Recipe**: Click "Predict" to generate the recipe
4. **View Results**: See ingredients and cooking instructions

### Sample Images

Try pre-loaded examples:
```
http://localhost:5000/pizza
http://localhost:5000/pasta
http://localhost:5000/salad
```

### Programmatic Usage

```python
from Foodimg2Ing.output import output

# Generate recipe from image path
title, ingredients, recipe = output('path/to/food_image.jpg')

print(f"Title: {title[0]}")
print(f"Ingredients: {ingredients[0]}")
print(f"Recipe: {recipe[0]}")
```

## Project Structure

```
dishcovery/
│
├── Foodimg2Ing/
│   ├── __init__.py
│   ├── app.py                  # Flask routes and application
│   ├── args.py                 # Argument parser and configuration
│   ├── model.py                # Main model wrapper
│   ├── output.py               # Inference pipeline
│   │
│   ├── modules/
│   │   ├── encoder.py          # CNN and label encoders
│   │   ├── transformer_decoder.py  # Transformer architecture
│   │   ├── multihead_attention.py  # Attention mechanism
│   │   └── utils.py            # Utility functions
│   │
│   ├── utils/
│   │   ├── metrics.py          # Loss functions and metrics
│   │   └── output_utils.py     # Output formatting
│   │
│   ├── data/
│   │   ├── modelbest.ckpt      # Pre-trained model weights
│   │   ├── ingr_vocab.pkl      # Ingredient vocabulary
│   │   └── instr_vocab.pkl     # Instruction vocabulary
│   │
│   ├── static/
│   │   ├── images/             # Sample food images
│   │   ├── demo_imgs/          # Uploaded images
│   │   └── css/                # Stylesheets
│   │
│   └── templates/
│       ├── home.html           # Landing page
│       ├── about.html          # About page
│       └── predict.html        # Results page
│
├── run.py                      # Application entry point
├── requirements.txt            # Python dependencies
├── README.md                   # This file
└── LICENSE                     # License information
```

## Model Details

### Pre-trained Components

#### 1. ResNet Encoder (ImageNet Pre-trained)
- **Dataset**: ImageNet (1.2M images, 1000 classes)
- **Training**: Performed by PyTorch/torchvision team
- **Purpose**: Universal image feature extraction
- **Usage**: Feature extractor (classification layers removed)

#### 2. Inverse Cooking Model (Recipe1M Pre-trained)
- **Dataset**: Recipe1M (~1M recipe-image pairs)
- **Training**: Based on "Inverse Cooking" paper (CVPR 2019)
- **Components**:
  - Ingredient encoder
  - Ingredient decoder (transformer)
  - Recipe decoder (transformer)
  - All attention layers

### Training Configuration

```python
Embedding Size: 512
Instruction Decoder:
  - Layers: 16
  - Attention Heads: 8
  - Dropout: 0.3

Ingredient Decoder:
  - Layers: 4
  - Attention Heads: 4
  - Dropout: 0.3

Image Processing:
  - Input Size: 224×224
  - Normalization: ImageNet stats
```

### Generation Parameters

```python
Max Sequence Length: 15 tokens per instruction
Max Instructions: 10 instructions
Max Ingredients: 20 ingredients
Temperature: 1.0 (for sampling mode)
Beam Size: -1 (greedy/sampling, no beam search)
```

## Workflow

### Detailed Pipeline

#### Step 1: Image Preprocessing
```python
Input: Raw food image (any size)
  ↓
Resize: 256×256
  ↓
Center Crop: 224×224
  ↓
Normalize: ImageNet mean/std
  ↓
Convert to Tensor: [1, 3, 224, 224]
```

#### Step 2: Feature Extraction
```python
Preprocessed Image
  ↓
ResNet-101 (without FC layers)
  ↓
Image Features: [1, 2048, 7, 7]
  ↓
1×1 Convolution + Dropout
  ↓
Projected Features: [1, 512, 49]
```

#### Step 3: Ingredient Prediction
```python
Image Features
  ↓
Ingredient Decoder (4-layer transformer)
  ↓
Autoregressive Generation:
  - Start with <START> token
  - Predict next ingredient
  - Stop at <EOS> token
  ↓
Ingredient IDs: [1, N] where N ≤ 20
  ↓
Map to Vocabulary
  ↓
Ingredient List: ["flour", "eggs", "milk", ...]
```

#### Step 4: Recipe Generation
```python
Image Features + Predicted Ingredients
  ↓
Ingredient Encoder: Convert to embeddings
  ↓
Recipe Decoder (16-layer transformer)
  ↓
Cross-Attention to:
  - Image features
  - Ingredient embeddings
  ↓
Autoregressive Generation:
  - Start with <START> token
  - Predict next word
  - Apply causal masking
  - Stop at max length or <END>
  ↓
Instruction IDs: [1, M] where M ≤ 150
  ↓
Map to Vocabulary
  ↓
Instruction Text: "1. Preheat oven to 350°F. 2. Mix flour..."
```

#### Step 5: Post-processing
```python
Raw Model Outputs
  ↓
Remove special tokens (<PAD>, <START>, <END>)
  ↓
Format as structured recipe:
  - Title
  - Ingredient list (bulleted)
  - Numbered instructions
  ↓
Validate output (check for completeness)
  ↓
Render in web template
```

### Generation Modes

#### Greedy Sampling
```python
At each step: Select token with highest probability
Advantages: Deterministic, fast
Disadvantages: Less diverse, may be repetitive
```

#### Temperature Sampling
```python
At each step: Sample from top-k tokens weighted by probability
Temperature parameter: Controls randomness (0.0 = greedy, >1.0 = more random)
Advantages: More diverse outputs
Disadvantages: May be less coherent
```

### Inference Time Complexity

```
Image Encoding: O(1) - Single forward pass
Ingredient Decoding: O(N) - N = number of ingredients (≤20)
Recipe Decoding: O(M) - M = number of tokens (≤150)
Total: ~2-5 seconds on CPU, <1 second on GPU
```

## 🛠️ Technologies Used

### Deep Learning
- **PyTorch**: Neural network framework
- **torchvision**: Pre-trained models and image transforms
- **TensorFlow/Keras**: Image preprocessing utilities

### Web Framework
- **Flask**: Backend web server
- **HTML/CSS**: Frontend interface
- **Jinja2**: Template rendering

### Data Processing
- **NumPy**: Numerical operations
- **Pillow (PIL)**: Image loading and manipulation
- **pickle**: Model and vocabulary serialization

### Model Architecture
- **Transformers**: Self-attention and cross-attention layers
- **ResNet**: Convolutional neural network backbone
- **Embeddings**: Learned representations for ingredients and words

## Limitations

### Model Limitations
- **Training Data**: Limited to Recipe1M dataset (Western cuisine bias)
- **Image Quality**: Works best with clear, well-lit food photos
- **Recipe Accuracy**: May generate plausible but not always correct recipes
- **Ingredient Precision**: May miss minor ingredients or seasonings
- **Cultural Diversity**: Limited exposure to diverse cuisines

### Technical Limitations
- **Computational**: Requires ~2GB RAM for inference
- **Latency**: 2-5 seconds per image on CPU
- **Batch Size**: Currently processes one image at a time
- **No Fine-tuning**: Model weights are frozen (no user customization)

### Known Issues
- May generate repetitive instructions
- Ingredient quantities not predicted
- No cooking time or temperature estimates (only mentioned in text)
- Limited to visual appearance (can't detect taste or texture)

## Acknowledgments

This project builds upon the following research and resources:

### Research Paper
```
Inverse Cooking: Recipe Generation from Food Images
Amaia Salvador, Michal Drozdzal, Xavier Giro-i-Nieto, Adriana Romero
CVPR 2019
```

### Original Implementation
- [Facebook Research - Inverse Cooking](https://github.com/facebookresearch/inversecooking)

### Datasets
- **Recipe1M**: Large-scale recipe dataset with images
- **ImageNet**: Pre-training dataset for ResNet

### Pre-trained Models
- **PyTorch torchvision**: ResNet models
- **Inverse Cooking authors**: Recipe generation model weights

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Potential Improvements
- [ ] Add batch processing for multiple images
- [ ] Implement beam search for better generation quality
- [ ] Add ingredient quantity prediction
- [ ] Support for more cuisines and dietary restrictions
- [ ] Fine-tuning interface for custom datasets
- [ ] API endpoint for programmatic access
- [ ] Docker containerization
- [ ] Add cooking time and difficulty estimates

## Contact

For questions or feedback, please open an issue or contact:
- **Your Name**: akshat22054@iiitd.ac.in
- **GitHub**: [@akshatrajsaxena](https://github.com/akshatrajsaxena)

## Star History

If you find this project useful, please consider giving it a star!

---

**Disclaimer**: This is an educational project demonstrating deployment of pre-trained models. The generated recipes should be verified before cooking. The model may produce inaccurate or incomplete recipes.

