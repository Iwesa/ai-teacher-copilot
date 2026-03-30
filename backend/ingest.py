import os
from dotenv import load_dotenv
from supabase import create_client, Client
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()

# 1. Connect to Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# 2. Initialize Gemini Embeddings (This converts text into vectors)
embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2-preview")

def ingest_pdf(file_path: str, grade: str, subject: str):
    print(f"Loading {file_path}...")
    
    # 3. Load the PDF
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    
    # 4. Split the PDF into smaller, meaningful chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=200,
        separators=["\n\n", "\n", " ", ""]
    )
    chunks = text_splitter.split_documents(docs)
    print(f"Split PDF into {len(chunks)} chunks. Generating embeddings...")

    # 5. Process each chunk and upload it to Supabase
    for i, chunk in enumerate(chunks):
        # Generate the vector embedding for the text
        vector = embeddings.embed_query(chunk.page_content)
        
        # Save to the database
        supabase.table("kicd_syllabus").insert({
            "content": chunk.page_content,
            "metadata": {"grade": grade, "subject": subject, "source": file_path, "page": chunk.metadata.get("page")},
            "embedding": vector
        }).execute()
        
        print(f"Inserted chunk {i+1}/{len(chunks)}")
        
    print("✅ Ingestion Complete!")

# --- How to use it ---
if __name__ == "__main__":
    # You will need to put a sample PDF in your backend folder to test this!
    # For example: 
    ingest_pdf("sample_file.pdf", grade="Grade 1", subject="Creative Arts")
    print("Script ready. Provide a PDF path to begin ingestion.")