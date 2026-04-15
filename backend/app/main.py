from fastapi import FastAPI
from app.database import Base, engine
from app.routers.attendance import router as attendance_router
from app.routers.assignments import router as assignments_router
from app.routers.notifications import router as notifications_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LMS Project API")

app.include_router(attendance_router, prefix="/attendance", tags=["Attendance"])
app.include_router(assignments_router, prefix="/assignments", tags=["Assignments"])
app.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])


@app.get("/")
def root():
    return {"message": "LMS FastAPI is running"}