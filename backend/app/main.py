import os
import django
from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from app.database import Base, engine
from app.routers.attendance import router as attendance_router
from app.routers.assignments import router as assignments_router
from app.routers.notifications import router as notifications_router
from app.routes.auth_google import router as google_router
from app.routes.auth_facebook import router as facebook_router
from app.routes.auth_github import router as github_router
from app.routes.auth_otp import router as otp_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LMS Project API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

# ✅ CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ IMPORTANT: add prefixes
app.include_router(attendance_router, prefix="/attendance", tags=["Attendance"])
app.include_router(assignments_router, prefix="/assignments", tags=["Assignments"])
app.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])

# Auth routes
app.include_router(google_router, tags=["Auth"])
app.include_router(facebook_router, tags=["Auth"])
app.include_router(github_router, tags=["Auth"])
app.include_router(otp_router, tags=["Auth"])

@app.get("/")
def root():
    return {"message": "LMS API is running"}