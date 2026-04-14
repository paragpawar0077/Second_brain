from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
import os

Base.metadata.create_all(bind=engine)

os.makedirs("uploads", exist_ok=True)
os.makedirs("chroma_db", exist_ok=True)

app = FastAPI(title="AI Second Brain API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Second Brain API is running"}