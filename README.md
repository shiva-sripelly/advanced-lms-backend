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
- Postman(API testing)
- JWT (python-jose)

#16-04-2026(Social End Points)
------------------------------------------------------------1
Overview

This project implements an authentication system for an LMS (Learning Management System) using a hybrid architecture:

Django → Database models & Admin Panel
FastAPI → Authentication APIs (OTP + Social Login)
JWT → Secure authentication tokens

The system supports:
--------------------------
OTP-based login/signup
Social login via Google, Facebook, and GitHub
Admin monitoring of users, OTP logs, and social accounts

Features:
================
Authentication
--------------------
OTP-based login/signup with verification
JWT token generation after successful authentication

Social Login (OAuth2)
----------------------
Google Login
Facebook Login
GitHub Login

Note: Social login APIs are implemented and ready. Live testing requires OAuth provider credentials.

Admin Panel (Django)
---------------------
Manage users
View SocialAccount records
Monitor OTP logs (verified/used)

## Tech Stack
- FastAPI
- Django
- MySQL
- SQLAlchemy
- Django ORM
- PyMySQL / mysqlclient
- Postman(API testing)
- JWT (python-jose)

=================================
Setup Instructions
=================================
1. Clone project
------------------------
git clone <your-repo-url>
cd LMS_PROJECT/backend

2. Create & activate virtual environment
----------------------------------------
python -m venv venv

venv\Scripts\activate
3. Install dependencies
----------------------------------------
pip install -r requirements.txt

4. Configure environment variables
----------------------------------------
Create a .env file in backend/:

SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
GOOGLE_CLIENT_ID=your_google_client_id

5. Run migrations
----------------------------------------
python manage.py makemigrations
python manage.py migrate

6. Create superuser
----------------------------------------
python manage.py createsuperuser

7. Run servers
----------------------------------------
Django (Admin Panel)
python manage.py runserver 8000
FastAPI (Auth APIs)
uvicorn app.main:app --reload --port 8001

API Endpoints
======================
Base URL:
----------------
http://127.0.0.1:8001
🔐 OTP Authentication
POST /auth/otp/request → Request OTP
POST /auth/otp/verify → Verify OTP & login

Social Authentication
---------------------------
POST /auth/google/login
POST /auth/facebook/login
POST /auth/github/login

Testing (Postman)
--------------------
Import the provided Postman collection:

OTP Request → Generate OTP
OTP Verify → Login and get JWT
Social login endpoints → Accept provider tokens

OAuth Setup (Optional)
============================
Google
---------
Go to Google Cloud Console
Create OAuth Client ID
Add to .env

Facebook
------------
Create app in Meta Developers
Generate user access token

GitHub
----------
Create OAuth app
Generate access token

Admin Panel
---------------
Open:

http://127.0.0.1:8000/admin/

You can manage:

Users
Social Accounts
OTP Logs

Authentication Flow
-------------------------
OTP Flow
User requests OTP
OTP is generated and stored in DB
User verifies OTP
JWT token is generated

Social Login Flow
----------------------
Client sends provider token
Backend verifies token with provider
User is created/linked
JWT token is returned

Expected Outcome
----------------
Users can login/signup using OTP
Social login APIs are implemented
JWT authentication is integrated
Admin can monitor all activities

Notes
--------
OTP flow is fully tested and functional
Social login requires real provider tokens for live testing
Swagger UI available at /docs
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@222
Author : @Shiva Sripelly