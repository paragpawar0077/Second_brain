from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os, shutil, uuid

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.models.document import Document
from app.models.chunk import Chunk
from app.models.user import User
from app.schemas.document import NoteCreate, DocumentResponse
from app.services.pdf_service import extract_text_from_pdf
from app.services.chunk_service import chunk_text
from app.services.embedding_service import embed_texts
from app.services.vector_service import add_chunks_to_vector_db, delete_document_vectors

router = APIRouter(prefix="/documents", tags=["documents"])

def process_document(doc, raw_text, db):
    """Chunk + embed + store in ChromaDB. Used by both upload and note."""
    chunks = chunk_text(raw_text)
    if not chunks:
        return

    embeddings = embed_texts(chunks)

    ids, documents, metadatas = [], [], []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        chunk_row = Chunk(
            document_id=doc.id,
            chunk_index=i,
            content=chunk
        )
        db.add(chunk_row)

        ids.append(f"doc-{doc.id}-chunk-{i}")
        documents.append(chunk)
        metadatas.append({
            "user_id": doc.user_id,
            "document_id": doc.id,
            "chunk_index": i,
            "title": doc.title,
            "source_type": doc.source_type
        })

    db.commit()
    add_chunks_to_vector_db(ids, documents, metadatas, embeddings)


@router.post("/upload")
def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    unique_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    raw_text = extract_text_from_pdf(file_path)

    doc = Document(
        user_id=current_user.id,
        title=file.filename.replace(".pdf", ""),
        file_name=file.filename,
        file_type="pdf",
        file_path=file_path,
        source_type="pdf",
        raw_text=raw_text
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    process_document(doc, raw_text, db)

    return {
        "message": "PDF uploaded and indexed successfully",
        "document_id": doc.id,
        "title": doc.title,
        "characters_extracted": len(raw_text)
    }


@router.post("/note")
def create_note(
    payload: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = Document(
        user_id=current_user.id,
        title=payload.title,
        source_type="note",
        raw_text=payload.content
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    process_document(doc, payload.content, db)

    return {
        "message": "Note created and indexed successfully",
        "document_id": doc.id,
        "title": doc.title
    }


@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Document).filter(Document.user_id == current_user.id).all()


@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == current_user.id
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.file_path and os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    delete_document_vectors(doc_id, current_user.id)
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}