from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from django.contrib.auth.models import User
from app.models import SocialAccount
from app.core.jwt_handler import create_access_token
import httpx

router = APIRouter(prefix="/auth/github" , tags=["Social Login's"])


class GitHubTokenSchema(BaseModel):
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
def github_login(payload: GitHubTokenSchema):
    headers = {
        "Authorization": f"Bearer {payload.access_token}",
        "Accept": "application/vnd.github+json"
    }

    user_resp = httpx.get("https://api.github.com/user", headers=headers)
    if user_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid GitHub token")

    user_data = user_resp.json()

    email_resp = httpx.get("https://api.github.com/user/emails", headers=headers)
    if email_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Unable to fetch GitHub email")

    emails = email_resp.json()
    primary_email = None

    for item in emails:
        if item.get("primary") and item.get("verified"):
            primary_email = item.get("email")
            break

    if not primary_email:
        raise HTTPException(status_code=400, detail="No verified primary email found on GitHub account")

    provider_user_id = str(user_data.get("id"))
    name = user_data.get("name") or user_data.get("login", "")

    user = User.objects.filter(email=primary_email).first()

    if not user:
        username = get_or_create_username(primary_email)
        first_name = name.split(" ")[0] if name else ""
        last_name = " ".join(name.split(" ")[1:]) if len(name.split(" ")) > 1 else ""
        user = User.objects.create(
            username=username,
            email=primary_email,
            first_name=first_name,
            last_name=last_name
        )
        user.set_unusable_password()
        user.save()

    SocialAccount.objects.update_or_create(
        provider="github",
        provider_user_id=provider_user_id,
        defaults={
            "user": user,
            "email": primary_email,
            "extra_data": user_data
        }
    )

    token = create_access_token({
        "sub": user.username,
        "user_id": user.id,
        "email": user.email
    })

    return {
        "message": "GitHub authentication successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }