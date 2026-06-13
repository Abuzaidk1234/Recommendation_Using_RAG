from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sys
import os
import random
from dotenv import load_dotenv

load_dotenv()
# Add parent directory to path to import existing scripts
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared_functions import *
from shared_functions import *
from enhanced_rag_chatbot import generate_llm_rag_response, generate_llm_comparison
from database import init_db, create_user, verify_user, save_chat_history, save_compare_history, get_user_history, delete_chat_history, delete_compare_history
app = FastAPI(title="Cuisine Compass API")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global database instances
food_items = []
main_collection = None

@app.on_event("startup")
@app.on_event("startup")
async def startup_event():
    global food_items, main_collection
    # Initialize the SQLite Database
    init_db()
    
    data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'FoodDataSet.json')
    food_items = load_food_data(data_path)
    main_collection = create_similarity_search_collection(
        "web_food_search",
        {'description': 'A collection for the Cuisine Compass web app'}
    )
    if main_collection.count() == 0:
        populate_similarity_collection(main_collection, food_items)
class SearchRequest(BaseModel):
    query: str
    cuisine_filter: Optional[str] = None
    max_calories: Optional[int] = None
    n_results: int = 5

class AuthRequest(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    query: str
    username: Optional[str] = None

class CompareRequest(BaseModel):
    query1: str
    query2: str
    username: Optional[str] = None
@app.post("/api/search")
async def search_food(request: SearchRequest):
    if request.cuisine_filter or request.max_calories:
        results = perform_filtered_similarity_search(
            main_collection,
            request.query,
            cuisine_filter=request.cuisine_filter,
            max_calories=request.max_calories,
            n_results=request.n_results
        )
    else:
        results = perform_similarity_search(main_collection, request.query, request.n_results)
    
    return {"results": results}

@app.post("/api/signup")
async def signup(request: AuthRequest):
    success = create_user(request.username, request.password)
    if not success:
        raise HTTPException(status_code=400, detail="Username already exists")
    return {"message": "User created successfully"}

@app.post("/api/login")
async def login(request: AuthRequest):
    success = verify_user(request.username, request.password)
    if not success:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"message": "Login successful", "username": request.username}

@app.get("/api/history/{username}")
async def get_history(username: str):
    return get_user_history(username)

@app.delete("/api/history/chat/{chat_id}")
async def delete_chat(chat_id: int):
    try:
        delete_chat_history(chat_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/history/compare/{comp_id}")
async def delete_compare(comp_id: int):
    try:
        delete_compare_history(comp_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat_rag(request: ChatRequest):
    search_results = perform_similarity_search(main_collection, request.query, 3)
    if not search_results:
        response_text = "I couldn't find any food items matching your request. Try describing what you're in the mood for with different words!"
        if request.username:
            save_chat_history(request.username, request.query, response_text, [])
        return {"response": response_text, "results": []}
        
    ai_response = generate_llm_rag_response(request.query, search_results)
    
    # Save to history if logged in
    if request.username:
        save_chat_history(request.username, request.query, ai_response, search_results)
        
    return {"response": ai_response, "results": search_results}

@app.get("/api/discover")
async def get_discover_cards():
    categories = [
        {"id": "healthy", "title": "Healthy Choices", "query": "healthy low calorie nutritious salad vegetable"},
        {"id": "italian", "title": "Italian Classics", "query": "italian pasta pizza cheese authentic"},
        {"id": "dessert", "title": "Sweet Desserts", "query": "sweet dessert chocolate cake sugar"},
        {"id": "spicy", "title": "Spicy & Hot", "query": "spicy hot chili curry pepper"},
        {"id": "quick", "title": "Quick Bites", "query": "quick fast snack bite easy"},
        {"id": "indian", "title": "Indian Flavors", "query": "indian curry masala spices traditional"}
    ]
    
    results = []
    for cat in categories:
        search_result = perform_similarity_search(main_collection, cat["query"], n_results=8)
        if search_result:
            results.append({
                "categoryId": cat["id"],
                "categoryTitle": cat["title"],
                "dish": search_result[0]
            })
            
    return {"categories": results}

@app.post("/api/compare")
async def compare_queries(request: CompareRequest):
    results1 = perform_similarity_search(main_collection, request.query1, 3)
    results2 = perform_similarity_search(main_collection, request.query2, 3)
    
    comparison_response = generate_llm_comparison(request.query1, request.query2, results1, results2)
    
    # Save to history if logged in
    if request.username:
        save_compare_history(request.username, request.query1, request.query2, comparison_response, results1, results2)
        
    return {"response": comparison_response, "results1": results1, "results2": results2}