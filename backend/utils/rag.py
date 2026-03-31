import os
from supabase import create_client, Client
from langchain_google_genai import GoogleGenerativeAIEmbeddings

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-2-preview")

def get_syllabus_context(search_query: str, doc_type: str = "document") -> str:
    """Searches Supabase for KICD context and returns it as a string."""
    print(f"🔍 Searching KICD database for {doc_type}: {search_query}...")
    
    try:
        query_vector = embeddings.embed_query(search_query)
        response = supabase.rpc(
            "match_syllabus", 
            {
                "query_embedding": query_vector,
                "match_count": 3
            }
        ).execute()
        
        if response.data:
            print(f"✅ Found relevant KICD syllabus data for {doc_type}!")
            return "\n\n".join([doc['content'] for doc in response.data])
            
    except Exception as e:
        print(f"⚠️ Search failed: {e}")
        
    return "No specific KICD syllabus context found. Proceed with general CBC best practices."