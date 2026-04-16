from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from django.contrib.auth.models import User
from app.models import SocialAccount
from app.core.jwt_handler import create_access_token
import httpx

router = APIRouter(prefix="/auth/facebook", tags=["Social Login's"])


class FacebookTokenSchema(BaseModel):
    access_token: str


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
def facebook_login(payload: FacebookTokenSchema):
    url = "https://graph.facebook.com/me"
    params = {
        "fields": "id,name,email",
        "access_token": payload.access_token
    }

    response = httpx.get(url, params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid Facebook token")

    info = response.json()

    email = info.get("email")
    provider_user_id = info.get("id")
    name = info.get("name", "")

    if not provider_user_id:
        raise HTTPException(status_code=400, detail="Facebook id missing")

# If email is missing, create a fallback email
    if not email:
        email = f"{provider_user_id}@facebook.com"

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
        provider="facebook",
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
        "message": "Facebook authentication successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }