from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NoteCreate(BaseModel):
    title: str
    content: str

class DocumentResponse(BaseModel):
    id: int
    title: str
    source_type: str
    file_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True