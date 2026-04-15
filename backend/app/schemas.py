from datetime import date
from typing import List, Optional
from pydantic import BaseModel


class AttendanceRecordCreate(BaseModel):
    student_id: int
    status: str


class AttendanceMarkRequest(BaseModel):
    course_id: int
    date: date
    records: List[AttendanceRecordCreate]


class GradeSubmissionRequest(BaseModel):
    submission_id: int
    grade: str
    remarks: Optional[str] = None


class MarkNotificationReadRequest(BaseModel):
    notification_id: int