from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from random import randint
from django.contrib.auth.models import User
from django.utils import timezone
from app.models import OTPLog
from app.core.jwt_handler import create_access_token
from datetime import timedelta

#router = APIRouter(prefix="/auth/otp", tags=["OTP Auth"])
router = APIRouter(prefix="/auth/otp", tags=["Social Login's"])

class OTPRequestSchema(BaseModel):
    email: EmailStr
    full_name: str | None = None


class OTPVerifySchema(BaseModel):
    email: EmailStr
    otp: str


def generate_username_from_email(email: str):
    base = email.split("@")[0]
    username = base
    count = 1
    while User.objects.filter(username=username).exists():
        username = f"{base}{count}"
        count += 1
    return username


@router.post("/request")
def request_otp(payload: OTPRequestSchema):
    otp = str(randint(100000, 999999))

    OTPLog.objects.create(
        email=payload.email,
        otp_code=otp,
        full_name=payload.full_name,
        purpose="login_signup",
        expires_at=timezone.now() + timedelta(minutes=5)
    )

    return {
        "message": "OTP generated successfully",
        "email": payload.email,
        "dev_otp": otp
    }


@router.post("/verify")
def verify_otp(payload: OTPVerifySchema):
    otp_entry = OTPLog.objects.filter(
        email=payload.email,
        otp_code=payload.otp,
        is_used=False
    ).order_by("-created_at").first()

    if not otp_entry:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if otp_entry.is_expired():
        raise HTTPException(status_code=400, detail="OTP expired")

    user = User.objects.filter(email=payload.email).first()

    if not user:
        username = generate_username_from_email(payload.email)

        first_name = ""
        last_name = ""

        if otp_entry.full_name:
            parts = otp_entry.full_name.strip().split(" ", 1)
            first_name = parts[0]
            if len(parts) > 1:
                last_name = parts[1]

        user = User.objects.create(
            username=username,
            email=payload.email,
            first_name=first_name,
            last_name=last_name,
        )
        user.set_unusable_password()
        user.save()

    otp_entry.user = user
    otp_entry.is_verified = True
    otp_entry.is_used = True
    otp_entry.verified_at = timezone.now()
    otp_entry.save()

    token = create_access_token({
        "sub": user.username,
        "user_id": user.id,
        "email": user.email
    })

    return {
        "message": "OTP verified successfully",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }