import chromadb
from app.core.config import settings

client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
collection = client.get_or_create_collection(name="document_chunks")

def add_chunks_to_vector_db(ids, documents, metadatas, embeddings):
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings
    )

def search_vectors(query_embedding, user_id: int, n_results: int = 5):
    try:
        return collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where={"user_id": user_id}
        )
    except Exception:
        return None

def delete_document_vectors(document_id: int, user_id: int):
    try:
        collection.delete(where={
            "document_id": document_id,
            "user_id": user_id
        })
    except Exception:
        pass