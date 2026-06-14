# Cuisine Compass: Full-Stack RAG Food Recommendation System

![Cuisine Compass Web App](https://img.shields.io/badge/Status-Live-success)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Database-orange)
![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-blue)
![Supabase](https://img.shields.io/badge/Database-Supabase-green)

Welcome to **Cuisine Compass**, a highly advanced, full-stack food recommendation platform. 

This project originally started as a console-only practice exercise to learn **Retrieval-Augmented Generation (RAG)**, **LangChain concepts**, **Vector Databases**, and **ChromaDB**. However, **I decided to use my full-stack development abilities to wrap the core AI concepts into a beautiful, fully functional modern web application.**

## 🌟 Features

- **Intelligent RAG Chatbot**: A conversational AI powered by Google Gemini that retrieves context from a food database (ChromaDB) to provide smart, context-aware recipes and recommendations.
- **Advanced Metadata Filtering**: Perform similarity searches while strictly filtering by cuisine type, maximum calories, and ingredients.
- **AI-Powered Dish Comparison**: Select two different food queries and let the AI generate a detailed, side-by-side Markdown comparison table.
- **Persistent User History**: Every chat and comparison is securely saved to a cloud PostgreSQL database (Supabase), accessible via a dedicated History tab.
- **Beautiful Modern UI**: A sleek, dark-themed, glassmorphism React frontend built with Vite.
- **Authentication**: Secure user login and registration powered by Clerk.

## 🧠 Core AI & Data Architecture

This project was built to master modern AI engineering workflows:

1. **Vector Embeddings**: Food items from `FoodDataSet.json` are converted into semantic vector embeddings using the `models/gemini-embedding-001` model. We handle API rate limits (100 requests/min) gracefully using automated chunking and retry-sleep logic.
2. **ChromaDB (Vector Database)**: Embeddings are stored in-memory using ChromaDB. Similarity searches use Cosine Distance to find the closest matching foods to a user's natural language query.
3. **Retrieval-Augmented Generation (RAG)**: 
   - **Retrieval**: Extract top matches from ChromaDB.
   - **Contextualization**: Convert the matches into structured context.
   - **Generation**: Feed the user's prompt and the structured context to the Google Gemini LLM to generate a conversational, highly accurate response without hallucination.

## 💻 Tech Stack

### Frontend
- **React & Vite**: Fast, modern frontend framework.
- **Tailwind-like Vanilla CSS**: Custom, highly polished styling.
- **Clerk**: Authentication and user management.
- **Deployed on Vercel**: Lightning-fast edge delivery.

### Backend
- **FastAPI (Python)**: High-performance asynchronous API server.
- **ChromaDB**: In-memory vector database for similarity search.
- **Google Generative AI (Gemini)**: Powers text embeddings and RAG conversational responses.
- **Supabase (PostgreSQL)**: Persistent cloud database for storing user chat history.
- **Deployed on Render**: 24/7 Virtual Private Server hosting the Python backend.

## 🚀 Running Locally

If you'd like to run the full stack on your own machine:

### 1. Backend Setup
```bash
# Navigate to the project root
pip install -r backend/requirements.txt

# Create a .env file in the root directory with your keys:
# GEMINI_API_KEY="your_google_gemini_key"
# SUPABASE_URL="your_supabase_url"
# SUPABASE_KEY="your_supabase_service_key"

# Run the FastAPI server
cd backend
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to the frontend
cd frontend
npm install

# Create a .env.local file in the frontend directory:
# VITE_API_URL="http://localhost:8000/api"
# VITE_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"

# Start the Vite development server
npm run dev
```

## 📚 What I Learned

By expanding this from a simple CLI script into a full-stack application, I successfully bridged the gap between raw AI engineering and real-world software development. I learned how to:
- Overcome the RAM limitations of deploying PyTorch/SentenceTransformers on free-tier servers by migrating to cloud-based embedding APIs.
- Handle strict LLM rate limits dynamically within a FastAPI startup event.
- Connect a modern React frontend to a Python/ChromaDB backend.
- Persist structured RAG history into a standard relational database (Supabase).

---
*The original console-only version of this project (which follows the strict lab instructions) is available on the `console-only-backup` branch.*
