# Interactive Food Search and RAG Chatbot System

This repository contains an advanced command-line food recommendation system that demonstrates three distinct approaches to similarity search and conversational AI. The project serves as an exploration of how Retrieval-Augmented Generation (RAG) works with Large Language Models (LLMs).

## Project Overview

Using a rich food dataset containing detailed nutritional information, ingredients, cooking methods, and taste profiles, this project implements:

1. **Interactive CLI Search Interface**: Real-time food search with immediate feedback.
2. **Advanced Filtered Search**: Sophisticated querying combining vector similarity search with metadata constraints (cuisine types, calorie restrictions).
3. **Intelligent RAG Chatbot**: A conversational AI system powered by ChromaDB and Large Language Models (LLMs) to provide natural, contextual food recommendations.

*Note: While the original project specification called for IBM Watsonx (Granite), this implementation was upgraded and adapted to use the **Google Gemini API** for enhanced text embeddings and generative capabilities.*

## Learning Objectives Achieved

- Built interactive CLI interfaces for real-time food search and recommendation.
- Implemented advanced search filtering using ChromaDB metadata (`$and`, `$lte`, exact matches).
- Created RAG systems combining semantic similarity search with natural language responses.
- Developed conversational chatbots capable of maintaining context and intelligently answering queries based strictly on provided data.
- Handled API limits gracefully using chunking and retry mechanisms for embedding large datasets.

## Architecture & Technologies Used

- **Python 3.11+**
- **ChromaDB**: For vector database creation, metadata management, and local similarity search operations.
- **Google Generative AI (Gemini)**: Replaced standard sentence-transformers to provide highly accurate semantic embeddings (`models/gemini-embedding-001`) and state-of-the-art conversational generation.
- **RAG Architecture**:
  - **Retrieval**: Extracting top-K relevant food items based on user queries via cosine similarity.
  - **Context Building**: Structuring raw JSON food data into readable context windows.
  - **Augmented Generation**: Passing the user query and the retrieved context to Gemini to generate natural, conversational responses.

## Getting Started

### Prerequisites
- Python 3.11+
- A Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Abuzaidk1234/Recommendation_Using_RAG.git
   cd Recommendation_Using_RAG
   ```

2. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   ```

### Running the Systems

The project is split into three standalone demonstration scripts:

1. **Interactive Basic Search**
   ```bash
   python interactive_search.py
   ```
   *Demonstrates simple vector similarity search.*

2. **Advanced Filtered Search**
   ```bash
   python advanced_search.py
   ```
   *Demonstrates metadata filtering (e.g., specific cuisines, calorie limits) combined with similarity search.*

3. **Enhanced RAG Chatbot**
   ```bash
   python enhanced_rag_chatbot.py
   ```
   *Launches the full conversational AI system. Test it with complex natural language queries like "I want something healthy and light for lunch under 300 calories."*

## Repository Structure

- `FoodDataSet.json`: The comprehensive food dataset.
- `shared_functions.py`: Reusable core functions for loading data, configuring the Gemini embedding function, building the ChromaDB collection, and performing searches.
- `interactive_search.py`: CLI script for basic similarity search.
- `advanced_search.py`: CLI script for advanced metadata filtering.
- `enhanced_rag_chatbot.py`: The main RAG conversational chatbot.

---
*Developed as a practice project to master RAG, LangChain concepts, ChromaDB, and Vector Databases.*
