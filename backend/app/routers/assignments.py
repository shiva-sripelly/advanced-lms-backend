from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Assignment, Course, Enrollment, Submission, User, Notification
from app.schemas import GradeSubmissionRequest
from app.utils.file_utils import save_uploaded_file

router = APIRouter()

def create_notification(db: Session, user_id: int, message: str, link: str = None):
    notification = Notification(
        user_id=user_id,
        message=message,
        link=link,
        is_read=False
    )
    db.add(notification)

@router.post("/create")
def create_assignment(
    course_id: int = Form(...),
    title: str = Form(...),
    description: str = Form(""),
    deadline: str = Form(...),
    created_by: int = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    faculty = db.query(User).filter(
        User.id == created_by,
        User.role == "faculty"
    ).first()
    if not faculty:
        raise HTTPException(status_code=403, detail="Only faculty can create assignments")

    try:
        parsed_deadline = datetime.fromisoformat(deadline)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid deadline format. Use YYYY-MM-DDTHH:MM:SS")

    if parsed_deadline <= datetime.now():
        raise HTTPException(status_code=400, detail="Deadline must be a future datetime")

    file_path = None
    if file:
        file_path = save_uploaded_file(file, "assignments")

    assignment = Assignment(
        course_id=course_id,
        title=title,
        description=description,
        deadline=parsed_deadline,
        file_url=file_path,
        created_by=created_by
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    
    enrolled_students = db.query(Enrollment).filter(
        Enrollment.course_id == course_id
    ).all()

    for enrollment in enrolled_students:
        create_notification(
            db,
            user_id=enrollment.student_id,
            message=f"New assignment created: {title}",
            link=f"/assignments/{assignment.id}"
        )

    db.commit()

    return {
        "message": "Assignment created successfully",
        "assignment_id": assignment.id,
        "course_id": course_id,
        "title": title,
        "deadline": str(parsed_deadline),
        "file_url": file_path
    }


@router.post("/submit")
def submit_assignment(
    assignment_id: int = Form(...),
    student_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    student = db.query(User).filter(
        User.id == student_id,
        User.role == "student"
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    enrolled = db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.course_id == assignment.course_id
    ).first()
    if not enrolled:
        raise HTTPException(status_code=400, detail="Student is not enrolled in this course")

    if datetime.now() > assignment.deadline:
        raise HTTPException(status_code=400, detail="Submission deadline has passed")

    duplicate = db.query(Submission).filter(
        Submission.assignment_id == assignment_id,
        Submission.student_id == student_id
    ).first()
    if duplicate:
        raise HTTPException(status_code=400, detail="Submission already exists for this student and assignment")

    file_path = save_uploaded_file(file, "submissions")

    submission = Submission(
        assignment_id=assignment_id,
        student_id=student_id,
        file_url=file_path
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return {
        "message": "Assignment submitted successfully",
        "submission_id": submission.id,
        "assignment_id": assignment_id,
        "student_id": student_id,
        "file_url": file_path,
        "submitted_at": str(submission.submitted_at)
    }


@router.put("/grade")
def grade_submission(payload: GradeSubmissionRequest, db: Session = Depends(get_db)):
    submission = db.query(Submission).filter(
        Submission.id == payload.submission_id
    ).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission.grade = payload.grade
    submission.remarks = payload.remarks
    create_notification(
        db,
        user_id=submission.student_id,
        message=f"Your submission for assignment ID {submission.assignment_id} has been graded",
        link=f"/assignments/submission/{submission.id}"
    )
    create_notification(
        db,
        user_id=submission.student_id,
        message=f"Your submission for assignment ID {submission.assignment_id} has been graded",
        link=f"/assignments/submission/{submission.id}"
    )
    db.commit()
    db.refresh(submission)

    return {
        "message": "Submission graded successfully",
        "submission_id": submission.id,
        "grade": submission.grade,
        "remarks": submission.remarks
    }