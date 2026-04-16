from django.contrib import admin
from .models import SocialAccount, OTPLog


@admin.register(SocialAccount)
class SocialAccountAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "provider", "provider_user_id", "email", "created_at")
    search_fields = ("user__username", "email", "provider_user_id")
    list_filter = ("provider", "created_at")


@admin.register(OTPLog)
class OTPLogAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "otp_code", "purpose", "is_verified", "is_used", "created_at", "expires_at")
    search_fields = ("email", "otp_code")
    list_filter = ("purpose", "is_verified", "is_used", "created_at")