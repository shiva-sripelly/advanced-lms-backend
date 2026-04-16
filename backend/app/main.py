'''import os
import django
from fastapi import FastAPI
from dotenv import load_dotenv
load_dotenv()

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
    title="LMS Authentication API",
    description="Authentication APIs for OTP and social login",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
    openapi_tags=[
        {
            "name": "Auth",
            "description": "Authentication endpoints",
        }
    ],
)


app.include_router(attendance_router)
app.include_router(assignments_router)
#app.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
app.include_router(notifications_router)
app.include_router(google_router)
app.include_router(facebook_router)
app.include_router(github_router)
app.include_router(otp_router)


@app.get("/", tags=["Auth"], summary="API Status")
def root():
    return {"message": "LMS Authentication API is running"}'''
    
import os
import django
from fastapi import FastAPI
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")

print("ENV PATH =", ENV_PATH)
load_dotenv(ENV_PATH)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from app.database import Base, engine
from app.routes.auth_google import router as google_router
from app.routes.auth_facebook import router as facebook_router
from app.routes.auth_github import router as github_router
from app.routes.auth_otp import router as otp_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LMS Authentication API",
    description="Authentication APIs for OTP and social login",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
    openapi_tags=[
        {
            "name": "Auth",
            "description": "Authentication endpoints",
        }
    ],
)

app.include_router(google_router, tags=["Auth"])
app.include_router(facebook_router, tags=["Auth"])
app.include_router(github_router, tags=["Auth"])
app.include_router(otp_router, tags=["Auth"])


@app.get("/", include_in_schema=False)
def root():
    return {"message": "LMS Authentication API is running"}