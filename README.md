# Advanced LMS Backend Features

## Project Overview
This project enhances the LMS backend with advanced developer-focused modules using FastAPI and Django.

## Modules Implemented

### 1. Attendance Management (FastAPI)
- Mark attendance for students by course and date
- View student attendance
- View course attendance
- Calculate attendance percentage
- Prevent duplicate attendance for same student/course/date

### 2. Assignment Module (FastAPI)
- Faculty can create assignments
- Students can submit assignment files
- Faculty can grade submissions
- Prevent duplicate submissions
- Prevent late submissions after deadline

### 3. Notifications (FastAPI)
- Notifications generated when:
  - attendance is marked
  - assignment is created
  - submission is graded
- Fetch notifications by user
- Mark notifications as read

### 4. Analytics (Django)
- JSON endpoint for dashboard analytics
- Returns:
  - total_students
  - avg_attendance
  - total_assignments
  - submissions_count

## Tech Stack
- FastAPI
- Django
- MySQL
- SQLAlchemy
- Django ORM
- PyMySQL / mysqlclient
- Postman

## Project Structure
```text
LMS_PROJECT/
│
├── backend/
│   ├── manage.py
│   ├── backend/
│   ├── analytics_app/
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── routers/
│       │   ├── attendance.py
│       │   ├── assignments.py
│       │   └── notifications.py
│       └── utils/
│           └── file_utils.py
│
├── uploads/
│   ├── assignments/
│   └── submissions/
├── docs/
├── fixtures/
├── postman/
└── README.md