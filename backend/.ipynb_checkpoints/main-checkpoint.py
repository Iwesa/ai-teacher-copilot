import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import the router we just created
from api.routes import router as generate_router

# Load environment variables (ANTHROPIC_API_KEY)
load_dotenv()

app = FastAPI(
    title="CBC Teacher Copilot API",
    description="Agentic backend for KICD-aligned lesson planning",
    version="1.0.0"
)

# Allow React local dev server to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the router
app.include_router(generate_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
