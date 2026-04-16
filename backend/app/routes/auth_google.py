from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from django.contrib.auth import get_user_model
from app.models import SocialAccount
from app.core.jwt_handler import create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests
import os

User = get_user_model()

router = APIRouter(prefix="/auth/google", tags=["Auth"])


class GoogleTokenSchema(BaseModel):
    id_token: str


def get_or_create_username(email: str):
    base = email.split("@")[0]
    username = base
    count = 1
    while User.objects.filter(username=username).exists():
        existing = User.objects.filter(username=username).first()
        if existing and existing.email == email:
            return username
        username = f"{base}{count}"
        count += 1
    return username


@router.post("/login")
def google_login(payload: GoogleTokenSchema):
    google_client_id = os.getenv("GOOGLE_CLIENT_ID", "")
    print("GOOGLE_CLIENT_ID FROM ENV =", google_client_id)

    if not google_client_id:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID is missing in .env")

    try:
        info = id_token.verify_oauth2_token(
            payload.id_token,
            requests.Request(),
            google_client_id
        )
        print("GOOGLE TOKEN INFO =", info)
    except Exception as e:
        print("GOOGLE VERIFY ERROR =", str(e))
        raise HTTPException(status_code=400, detail="Invalid Google token")

    email = info.get("email")
    provider_user_id = info.get("sub")
    name = info.get("name", "")

    if not email or not provider_user_id:
        raise HTTPException(status_code=400, detail="Google email or sub missing")

    user = User.objects.filter(email=email).first()

    if not user:
        username = get_or_create_username(email)
        first_name = name.split(" ")[0] if name else ""
        last_name = " ".join(name.split(" ")[1:]) if len(name.split(" ")) > 1 else ""
        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        user.set_unusable_password()
        user.save()

    SocialAccount.objects.update_or_create(
        provider="google",
        provider_user_id=provider_user_id,
        defaults={
            "user": user,
            "email": email,
            "extra_data": info
        }
    )

    token = create_access_token({
        "sub": user.username,
        "user_id": user.id,
        "email": user.email
    })

    return {
        "message": "Google authentication successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }