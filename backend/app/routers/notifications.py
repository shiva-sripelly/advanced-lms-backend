from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Notification, User
from app.schemas import MarkNotificationReadRequest

router = APIRouter()


@router.get("/{user_id}")
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    notifications = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).all()

    return {
        "user_id": user_id,
        "user_name": user.name,
        "total_notifications": len(notifications),
        "notifications": [
            {
                "id": n.id,
                "message": n.message,
                "link": n.link,
                "is_read": n.is_read,
                "created_at": str(n.created_at)
            }
            for n in notifications
        ]
    }


@router.post("/mark-read")
def mark_notification_read(payload: MarkNotificationReadRequest, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(
        Notification.id == payload.notification_id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()
    db.refresh(notification)

    return {
        "message": "Notification marked as read",
        "notification_id": notification.id,
        "is_read": notification.is_read
    }