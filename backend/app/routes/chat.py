from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.dependencies import get_current_user
from app.services.embedding_service import embed_query
from app.services.vector_service import search_vectors
from app.services.rag_service import build_context, answer_with_groq
from app.models.user import User
from app.services.activity_service import log_activity
from app.core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/chat", tags=["chat"])

class QuestionRequest(BaseModel):
    question: str

@router.post("/ask")
def ask_question(
    payload: QuestionRequest,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Step 1: embed the question
    query_embedding = embed_query(payload.question)

    # Step 2: retrieve top 5 relevant chunks from ChromaDB
    results = search_vectors(
        query_embedding,
        user_id=current_user.id,
        n_results=5
    )

    if not results or not results["documents"][0]:
        return {
            "question": payload.question,
            "answer": "No relevant documents found. Please upload some documents first.",
            "sources": []
        }

    chunks = results["documents"][0]
    metadatas = results["metadatas"][0]

    # Step 3: build context from chunks
    context = build_context(chunks)

    # Step 4: get answer from Groq LLM
    answer = answer_with_groq(payload.question, context)

    log_activity(db, current_user.id, "ask", f"Asked: {payload.question[:100]}")

    # Step 5: format source references
    sources = []
    for i, meta in enumerate(metadatas):
        sources.append({
            "rank": i + 1,
            "title": meta.get("title"),
            "document_id": meta.get("document_id"),
            "chunk_index": meta.get("chunk_index"),
            "source_type": meta.get("source_type"),
            "preview": chunks[i][:200] + "..."
        })

    return {
        "question": payload.question,
        "answer": answer,
        "sources_used": len(sources),
        "sources": sources
    }