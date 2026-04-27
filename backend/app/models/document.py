from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    file_name = Column(String, nullable=True)
    file_type = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    source_type = Column(String, nullable=False)  # "pdf" or "note"
    raw_text = Column(Text, nullable=True)
    summary_short = Column(Text, nullable=True)
    summary_detailed = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)