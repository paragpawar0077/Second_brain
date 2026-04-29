from fastapi import APIRouter, Depends, Query
from app.core.dependencies import get_current_user
from app.services.embedding_service import embed_query
from app.services.vector_service import search_vectors
from app.models.user import User

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/")
def semantic_search(
    q: str = Query(..., description="Your search query"),
    current_user: User = Depends(get_current_user)
):
    # Step 1: convert query to embedding
    query_embedding = embed_query(q)

    # Step 2: search ChromaDB for closest chunks
    results = search_vectors(
        query_embedding,
        user_id=current_user.id,
        n_results=5
    )

    if not results or not results["documents"][0]:
        return {"query": q, "results": []}

    # Step 3: format results cleanly
    formatted = []
    for i, doc in enumerate(results["documents"][0]):
        formatted.append({
            "rank": i + 1,
            "chunk_text": doc,
            "title": results["metadatas"][0][i].get("title"),
            "document_id": results["metadatas"][0][i].get("document_id"),
            "chunk_index": results["metadatas"][0][i].get("chunk_index"),
            "source_type": results["metadatas"][0][i].get("source_type")
        })

    return {"query": q, "total_results": len(formatted), "results": formatted}