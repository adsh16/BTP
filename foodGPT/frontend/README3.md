# Dishcovery 🍳

**Dishcovery** (formerly FoodGPT) is an intelligent AI-powered cooking assistant that transforms food images into detailed recipes. It leverages **Google Gemini Pro Vision** for image analysis and **Firebase** for secure, persistent user data management.

![Dishcovery App](/public/logo.png)

## 🚀 Key Features

### 🤖 AI-Powered Recipe Generation
- **Image-to-Recipe**: Upload any food image (JPG, PNG, WebP) to instantly generate a structured recipe.
- **Smart Analysis**: Uses **Gemini Pro Vision** to identify ingredients, estimate cooking time, and generate step-by-step instructions.
- **Multi-Step Loader**: Visual progress tracking through "Uploading", "Analyzing", "Extracting", and "Generating" stages.

### � Persistent Chat Assistant
- **Context-Aware Chat**: The AI assistant knows exactly which recipe you're looking at and can answer specific questions about it.
- **Chat History**: All conversations are automatically saved to **Firebase Firestore**.
- **Resume Anytime**: Your chat history is persistent. Reload the page or log in from a different device, and your previous conversations (including the recipe context) are fully restored.

### 🔐 Secure Authentication
- **Google Sign-In**: One-click login using **Firebase Authentication** with Google provider.
- **Email/Password**: Traditional sign-up/sign-in support.
- **User Profiles**: Custom user profiles with avatars and personalized settings.

### 🎨 Modern User Experience
- **Responsive Design**: Fully responsive UI built with **Tailwind CSS**.
- **Dark Mode**: Seamless dark/light mode support.
- **Interactive UI**: Drag-and-drop file uploads, animated transitions (Framer Motion), and markdown rendering for chat messages.

## 🛠️ Technical Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **State Management**: React Context (`AuthContext`) & Custom Hooks (`useChatHistory`)
- **Styling**: Tailwind CSS, `lucide-react` icons
- **Animations**: `framer-motion`
- **Data Persistence**: `firebase/firestore` for real-time data syncing

### Backend (Flask)
- **API**: Flask RESTful API
- **AI Model**: `google-generativeai` (Gemini Pro Vision)
- **Security**: Firebase Admin SDK for token verification
- **CORS**: Configured for secure cross-origin requests

## 💾 Data Schema (Firestore)

The application uses a structured NoSQL schema in Firestore:

- **Users Collection** (`users/{userId}`)
  - **Chats Sub-collection** (`users/{userId}/chats/{chatId}`)
    - `title`: Auto-generated chat title
    - `messages`: Array of message objects (role, content, timestamp)
    - `recipe`: Embedded recipe data (title, ingredients, instructions, image_url)
    - `createdAt` / `updatedAt`: Server timestamps

## 🔗 Application URLs

Once running locally:

- **Frontend (Web App)**: [http://localhost:3000](http://localhost:3000)
- **Backend (API)**: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- **Firebase Project**: You need a Firebase project with **Authentication** (Google & Email/Password enabled) and **Firestore** enabled.
- **Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd foodGPT
   ```

2. **Backend Setup**
   ```bash
   # Create virtual environment
   python -m venv .venv
   
   # Activate virtual environment
   # Windows:
   .venv\Scripts\activate
   # Mac/Linux:
   source .venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**

   **Backend (`foodGPT/.env`):**
   ```env
   FIREBASE_ADMIN_CREDENTIALS_PATH=./serviceAccountKey.json
   GEMINI_API_KEY=your_gemini_api_key
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   SECRET_KEY=your_secret_key
   ```
   *Note: Place your Firebase `serviceAccountKey.json` in the root `foodGPT` folder.*

   **Frontend (`foodGPT/frontend/.env.local`):**
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   ```

### Running the Application

1. **Start the Backend** (from root `foodGPT` folder)
   ```bash
   python run.py
   ```

2. **Start the Frontend** (from `foodGPT/frontend` folder)
   ```bash
   npm run dev
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
