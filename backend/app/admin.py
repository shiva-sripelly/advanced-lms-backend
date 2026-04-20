'''from django.contrib import admin
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
    list_filter = ("purpose", "is_verified", "is_used", "created_at")'''
    
    
from django.contrib import admin
from .models import SocialAccount, OTPLog, PaymentTransaction


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


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "payment_type",
        "item_name",
        "amount",
        "currency",
        "status",
        "access_granted",
        "stripe_checkout_session_id",
        "created_at",
    )
    search_fields = (
        "user__username",
        "user__email",
        "item_name",
        "product_key",
        "stripe_checkout_session_id",
        "stripe_payment_intent_id",
    )
    list_filter = ("payment_type", "status", "access_granted", "currency", "created_at")
    readonly_fields = ("created_at", "updated_at", "paid_at")