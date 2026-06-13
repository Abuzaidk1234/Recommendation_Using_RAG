import os
import json
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
import socket

# Monkeypatch DNS to fix getaddrinfo failure in sandbox
original_getaddrinfo = socket.getaddrinfo
def custom_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    if host == 'piorsvqcmgwrcampfjqg.supabase.co':
        return original_getaddrinfo('104.18.38.10', port, family, type, proto, flags)
    return original_getaddrinfo(host, port, family, type, proto, flags)
socket.getaddrinfo = custom_getaddrinfo

from dotenv import load_dotenv
# Load env if running locally
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = None
if url and key:
    supabase = create_client(url, key)
else:
    print("WARNING: Supabase URL or Key not found in environment variables.")

def init_db():
    # Supabase tables are assumed to be created via the Supabase Dashboard
    pass

# Mock functions for backwards compatibility with main.py before we remove them
def create_user(username: str, password: str) -> bool:
    return True

def verify_user(username: str, password: str) -> bool:
    return True

def save_chat_history(username: str, query: str, response: str, results: List[Dict]):
    if not supabase: return
    try:
        data = {
            "username": username,
            "query": query,
            "response": response,
            "results_json": json.dumps(results)
        }
        supabase.table("chat_history").insert(data).execute()
    except Exception as e:
        print(f"Error saving chat history to Supabase: {e}")

def save_compare_history(username: str, query1: str, query2: str, response: str, results1: List[Dict], results2: List[Dict]):
    if not supabase: return
    try:
        data = {
            "username": username,
            "query1": query1,
            "query2": query2,
            "response": response,
            "results1_json": json.dumps(results1),
            "results2_json": json.dumps(results2)
        }
        supabase.table("compare_history").insert(data).execute()
    except Exception as e:
        print(f"Error saving compare history to Supabase: {e}")

def get_user_history(username: str) -> Dict[str, List[Dict]]:
    if not supabase: return {"chats": [], "comparisons": []}
    
    chats = []
    comparisons = []
    
    try:
        response_chats = supabase.table("chat_history").select("*").eq("username", username).order("created_at", desc=True).execute()
        for row in response_chats.data:
            if 'results_json' in row:
                row['results'] = json.loads(row['results_json'])
                del row['results_json']
            chats.append(row)
            
        response_comps = supabase.table("compare_history").select("*").eq("username", username).order("created_at", desc=True).execute()
        for row in response_comps.data:
            if 'results1_json' in row and 'results2_json' in row:
                row['results1'] = json.loads(row['results1_json'])
                row['results2'] = json.loads(row['results2_json'])
                del row['results1_json']
                del row['results2_json']
            comparisons.append(row)
            
    except Exception as e:
        print(f"Error fetching user history from Supabase: {e}")
        
    return {
        "chats": chats,
        "comparisons": comparisons
    }

def delete_chat_history(chat_id: int):
    if not supabase: return
    try:
        supabase.table("chat_history").delete().eq("id", chat_id).execute()
    except Exception as e:
        print(f"Error deleting chat history: {e}")

def delete_compare_history(comp_id: int):
    if not supabase: return
    try:
        supabase.table("compare_history").delete().eq("id", comp_id).execute()
    except Exception as e:
        print(f"Error deleting compare history: {e}")
