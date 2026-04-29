from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from app.core.database import Base, engine
from app.models import user, document, chunk
from app.routes import auth, documents, search, chat
import os

Base.metadata.create_all(bind=engine)

os.makedirs("uploads", exist_ok=True)
os.makedirs("chroma_db", exist_ok=True)

security = HTTPBearer()

app = FastAPI(title="AI Second Brain API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(search.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "AI Second Brain API is running"}