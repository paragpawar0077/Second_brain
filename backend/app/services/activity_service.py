from app.models.activity import Activity

def log_activity(db, user_id: int, action_type: str, description: str):
    """Call this after every user action to log it."""
    row = Activity(
        user_id=user_id,
        action_type=action_type,
        description=description
    )
    db.add(row)
    db.commit()