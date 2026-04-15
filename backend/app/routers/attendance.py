from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Attendance, Course, Enrollment, User, Notification
from app.schemas import AttendanceMarkRequest

router = APIRouter()

ALLOWED_STATUS = {"Present", "Absent", "Late"}

def create_notification(db: Session, user_id: int, message: str, link: str = None):
    notification = Notification(
        user_id=user_id,
        message=message,
        link=link,
        is_read=False
    )
    db.add(notification)

@router.post("/mark")
def mark_attendance(payload: AttendanceMarkRequest, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if not payload.records:
        raise HTTPException(status_code=400, detail="Attendance records are required")

    created_records = []

    for record in payload.records:
        if record.status not in ALLOWED_STATUS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status for student {record.student_id}. Allowed: Present, Absent, Late"
            )

        student = db.query(User).filter(
            User.id == record.student_id,
            User.role == "student"
        ).first()
        if not student:
            raise HTTPException(
                status_code=404,
                detail=f"Student {record.student_id} not found"
            )

        enrolled = db.query(Enrollment).filter(
            Enrollment.student_id == record.student_id,
            Enrollment.course_id == payload.course_id
        ).first()
        if not enrolled:
            raise HTTPException(
                status_code=400,
                detail=f"Student {record.student_id} is not enrolled in this course"
            )

        duplicate = db.query(Attendance).filter(
            Attendance.student_id == record.student_id,
            Attendance.course_id == payload.course_id,
            Attendance.date == payload.date
        ).first()
        if duplicate:
            raise HTTPException(
                status_code=400,
                detail=f"Attendance already marked for student {record.student_id} on {payload.date}"
            )

        attendance = Attendance(
            student_id=record.student_id,
            course_id=payload.course_id,
            date=payload.date,
            status=record.status
        )
        db.add(attendance)

        create_notification(
            db,
            user_id=record.student_id,
            message=f"Attendance marked for course ID {payload.course_id} on {payload.date}: {record.status}",
            link=f"/attendance/student/{record.student_id}?course_id={payload.course_id}"
        )
        
        created_records.append({
            "student_id": record.student_id,
            "status": record.status
        })

    db.commit()

    return {
        "message": "Attendance marked successfully",
        "course_id": payload.course_id,
        "date": payload.date,
        "records_created": created_records
    }


@router.get("/student/{student_id}")
def get_student_attendance(
    student_id: int,
    course_id: int = Query(...),
    db: Session = Depends(get_db)
):
    student = db.query(User).filter(
        User.id == student_id,
        User.role == "student"
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    records = db.query(Attendance).filter(
        Attendance.student_id == student_id,
        Attendance.course_id == course_id
    ).all()

    total_classes = len(records)
    present_count = sum(1 for r in records if r.status == "Present")
    absent_count = sum(1 for r in records if r.status == "Absent")
    late_count = sum(1 for r in records if r.status == "Late")
    percentage = (present_count / total_classes * 100) if total_classes > 0 else 0

    return {
        "student_id": student_id,
        "course_id": course_id,
        "student_name": student.name,
        "course_title": course.title,
        "total_classes": total_classes,
        "present": present_count,
        "absent": absent_count,
        "late": late_count,
        "attendance_percentage": round(percentage, 2),
        "records": [
            {
                "date": str(r.date),
                "status": r.status
            } for r in records
        ]
    }


@router.get("/course/{course_id}")
def get_course_attendance(
    course_id: int,
    from_date: date = Query(..., alias="from"),
    to_date: date = Query(..., alias="to"),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    records = db.query(Attendance).filter(
        Attendance.course_id == course_id,
        Attendance.date >= from_date,
        Attendance.date <= to_date
    ).all()

    total_records = len(records)
    present_count = sum(1 for r in records if r.status == "Present")
    absent_count = sum(1 for r in records if r.status == "Absent")
    late_count = sum(1 for r in records if r.status == "Late")
    percentage = (present_count / total_records * 100) if total_records > 0 else 0

    return {
        "course_id": course_id,
        "course_title": course.title,
        "from": str(from_date),
        "to": str(to_date),
        "total_records": total_records,
        "present_records": present_count,
        "absent_records": absent_count,
        "late_records": late_count,
        "attendance_percentage": round(percentage, 2),
        "records": [
            {
                "student_id": r.student_id,
                "date": str(r.date),
                "status": r.status
            } for r in records
        ]
    }