from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema on startup
    await init_db()
    yield

app = FastAPI(
    title="PhantomCheck AI API",
    description="Backend API for PhantomCheck AI (Don't Just Believe It. Investigate It.)",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "PhantomCheck AI",
        "model": settings.ollama_model,
    }

app.include_router(api_router, prefix="/api")
