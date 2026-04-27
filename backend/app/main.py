from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from app.core.database import Base, engine
from app.routes import auth, documents
import os

Base.metadata.create_all(bind=engine)

os.makedirs("uploads", exist_ok=True)
os.makedirs("chroma_db", exist_ok=True)

security = HTTPBearer()

app = FastAPI(
    title="AI Second Brain API",
    swagger_ui_init_oauth={},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)

@app.get("/")
def read_root():
    return {"message": "AI Second Brain API is running"}