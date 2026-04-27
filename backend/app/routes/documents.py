from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os, shutil, uuid

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.models.document import Document
from app.models.user import User
from app.schemas.document import NoteCreate, DocumentResponse
from app.services.pdf_service import extract_text_from_pdf

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Save file with unique name to avoid collisions
    unique_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text from PDF
    raw_text = extract_text_from_pdf(file_path)

    # Save document metadata to SQLite
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

    return {
        "message": "PDF uploaded successfully",
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

    return {
        "message": "Note created successfully",
        "document_id": doc.id,
        "title": doc.title
    }

@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    docs = db.query(Document).filter(Document.user_id == current_user.id).all()
    return docs

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

    # Delete physical file if it exists
    if doc.file_path and os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}