from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.activity import Activity
from app.models.document import Document
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Total counts for the user's dashboard."""
    total_docs = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.source_type == "pdf"
    ).count()

    total_notes = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.source_type == "note"
    ).count()

    total_searches = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.action_type == "search"
    ).count()

    total_questions = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.action_type == "ask"
    ).count()

    total_uploads = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.action_type == "upload"
    ).count()

    return {
        "total_documents": total_docs,
        "total_notes": total_notes,
        "total_searches": total_searches,
        "total_questions_asked": total_questions,
        "total_uploads": total_uploads
    }

@router.get("/recent")
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Last 10 actions the user performed."""
    activities = db.query(Activity).filter(
        Activity.user_id == current_user.id
    ).order_by(Activity.timestamp.desc()).limit(10).all()

    return [
        {
            "action_type": a.action_type,
            "description": a.description,
            "timestamp": a.timestamp
        }
        for a in activities
    ]

@router.get("/insights")
def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Simple rule-based insights for the user."""
    insights = []

    total_docs = db.query(Document).filter(
        Document.user_id == current_user.id
    ).count()

    total_searches = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.action_type == "search"
    ).count()

    total_questions = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.action_type == "ask"
    ).count()

    # Rule based insights
    if total_docs == 0:
        insights.append("Upload your first PDF or note to get started.")

    if total_docs > 0 and total_searches == 0:
        insights.append("You have documents — try searching them!")

    if total_searches > 5:
        insights.append(f"You have searched {total_searches} times — you are actively using your knowledge base.")

    if total_questions > 10:
        insights.append("Heavy AI usage detected — consider uploading more documents for better answers.")

    if total_docs > 5:
        insights.append(f"Great library! You have {total_docs} documents indexed.")

    if not insights:
        insights.append("Keep uploading documents and asking questions to get personalized insights.")

    return {"insights": insights}