import os
from decimal import Decimal

import stripe
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

from app.models import PaymentTransaction
from app.schemas import CreateCheckoutSessionRequest

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

User = get_user_model()

PAYMENT_CATALOG = {
    "course_python_masterclass": {
        "payment_type": "course",
        "name": "Python Masterclass",
        "description": "Full access to the Python course with assignments and course materials.",
        "amount_minor": 49900,
        "currency": "inr",
        "course_id": 1,
        "plan_name": None,
    },
    "course_web_development": {
        "payment_type": "course",
        "name": "Web Development Bootcamp",
        "description": "Purchase access to the Web Development course.",
        "amount_minor": 69900,
        "currency": "inr",
        "course_id": 2,
        "plan_name": None,
    },
    "premium_monthly": {
        "payment_type": "premium",
        "name": "Premium Monthly Plan",
        "description": "Monthly premium plan for advanced LMS features.",
        "amount_minor": 99900,
        "currency": "inr",
        "course_id": None,
        "plan_name": "Monthly",
    },
    "premium_yearly": {
        "payment_type": "premium",
        "name": "Premium Yearly Plan",
        "description": "Yearly premium plan with discounted pricing.",
        "amount_minor": 999900,
        "currency": "inr",
        "course_id": None,
        "plan_name": "Yearly",
    },
}


def _minor_to_decimal(amount_minor: int) -> Decimal:
    return Decimal(amount_minor) / Decimal("100")


def _serialize_transaction(txn: PaymentTransaction) -> dict:
    return {
        "id": txn.id,
        "user_id": txn.user_id,
        "item_name": txn.item_name,
        "product_key": txn.product_key,
        "payment_type": txn.payment_type,
        "course_id": txn.course_id,
        "plan_name": txn.plan_name,
        "amount": float(txn.amount),
        "currency": txn.currency,
        "status": txn.status,
        "access_granted": txn.access_granted,
        "stripe_checkout_session_id": txn.stripe_checkout_session_id,
        "stripe_payment_intent_id": txn.stripe_payment_intent_id,
        "customer_email": txn.customer_email,
        "paid_at": txn.paid_at.isoformat() if txn.paid_at else None,
        "created_at": txn.created_at.isoformat(),
    }


def _sync_transaction_from_session(txn: PaymentTransaction, session) -> None:
    session_data = session.to_dict() if hasattr(session, "to_dict") else session

    payment_status = session_data.get("payment_status")
    payment_intent_id = session_data.get("payment_intent")
    customer_email = session_data.get("customer_email")
    metadata = session_data.get("metadata") or {}

    if payment_status == "paid":
        txn.status = "paid"
        txn.access_granted = True
        txn.stripe_payment_intent_id = payment_intent_id
        txn.customer_email = customer_email
        txn.metadata = metadata
        if not txn.paid_at:
            txn.paid_at = timezone.now()
        txn.save()


@router.get("/catalog")
def get_payment_catalog():
    items = []
    for key, item in PAYMENT_CATALOG.items():
        items.append(
            {
                "product_key": key,
                "payment_type": item["payment_type"],
                "name": item["name"],
                "description": item["description"],
                "amount": float(_minor_to_decimal(item["amount_minor"])),
                "currency": item["currency"],
                "course_id": item["course_id"],
                "plan_name": item["plan_name"],
            }
        )

    return {"items": items}


@router.post("/create-checkout-session")
def create_checkout_session(payload: CreateCheckoutSessionRequest):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe secret key is not configured")

    user = User.objects.filter(id=payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Authenticated user not found")

    product = PAYMENT_CATALOG.get(payload.product_key)
    if not product:
        raise HTTPException(status_code=404, detail="Invalid product selected")

    metadata = {
        "user_id": str(user.id),
        "product_key": payload.product_key,
        "payment_type": product["payment_type"],
        "course_id": str(product["course_id"] or ""),
        "plan_name": str(product["plan_name"] or ""),
    }

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": product["currency"],
                        "unit_amount": product["amount_minor"],
                        "product_data": {
                            "name": product["name"],
                            "description": product["description"],
                        },
                    },
                    "quantity": 1,
                }
            ],
            customer_email=user.email or None,
            success_url=f"{FRONTEND_URL}/payments/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/payments/cancel",
            metadata=metadata,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Stripe checkout creation failed: {str(exc)}")

    PaymentTransaction.objects.update_or_create(
        stripe_checkout_session_id=session.id,
        defaults={
            "user": user,
            "stripe_payment_intent_id": getattr(session, "payment_intent", None),
            "product_key": payload.product_key,
            "payment_type": product["payment_type"],
            "item_name": product["name"],
            "course_id": product["course_id"],
            "plan_name": product["plan_name"],
            "amount": _minor_to_decimal(product["amount_minor"]),
            "currency": product["currency"],
            "status": "pending",#failed, cancelled
            "access_granted": False,
            "customer_email": user.email,
            "metadata": metadata,
        },
    )

    return {
        "message": "Checkout session created successfully",
        "session_id": session.id,
        "checkout_url": session.url,
    }


@router.get("/my-transactions/{user_id}")
def get_my_transactions(user_id: int):
    user = User.objects.filter(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    transactions = PaymentTransaction.objects.filter(user_id=user_id).order_by("-created_at")
    return {
        "user_id": user_id,
        "transactions": [_serialize_transaction(txn) for txn in transactions],
    }


@router.get("/session/{session_id}")
def get_checkout_session_details(session_id: str):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe secret key is not configured")

    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=f"Unable to retrieve checkout session: {str(exc)}")

    txn = PaymentTransaction.objects.filter(stripe_checkout_session_id=session_id).first()

    if txn:
        try:
            _sync_transaction_from_session(txn, session)
        except Exception as exc:
            print("SESSION SYNC ERROR:", str(exc))

    txn = PaymentTransaction.objects.filter(stripe_checkout_session_id=session_id).first()

    return {
        "session_id": session.id,
        "payment_status": getattr(session, "payment_status", None),
        "status": getattr(session, "status", None),
        "customer_email": getattr(session, "customer_email", None),
        "amount_total": (getattr(session, "amount_total", 0) or 0) / 100,
        "currency": getattr(session, "currency", None),
        "metadata": getattr(session, "metadata", {}),
        "local_transaction": _serialize_transaction(txn) if txn else None,
    }


@router.post("/webhook")
async def stripe_webhook(request: Request):
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Stripe webhook secret is not configured")

    payload = await request.body()
    signature = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            signature,
            STRIPE_WEBHOOK_SECRET,
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid webhook payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    event_type = event["type"]

    try:
        if event_type == "checkout.session.completed":
            session_obj = event["data"]["object"]
            session = session_obj.to_dict()

            session_id = session.get("id")
            payment_intent_id = session.get("payment_intent")
            customer_email = session.get("customer_email")
            metadata = session.get("metadata") or {}

            txn = await sync_to_async(
                lambda: PaymentTransaction.objects.filter(
                    stripe_checkout_session_id=session_id
                ).first()
            )()

            if not txn:
                print("Webhook: transaction not found for session:", session_id)
                return JSONResponse(
                    {"received": True, "message": "Transaction not found"},
                    status_code=200,
                )

            txn.status = "paid"
            txn.access_granted = True
            txn.stripe_payment_intent_id = payment_intent_id
            txn.customer_email = customer_email
            txn.metadata = metadata
            txn.paid_at = timezone.now()

            await sync_to_async(txn.save)()
            print("Webhook success: marked transaction paid ->", txn.id)

        elif event_type == "checkout.session.expired":
            session_obj = event["data"]["object"]
            session = session_obj.to_dict()
            session_id = session.get("id")

            txn = await sync_to_async(
                lambda: PaymentTransaction.objects.filter(
                    stripe_checkout_session_id=session_id
                ).first()
            )()

            if txn and txn.status == "pending":
                txn.status = "cancelled"
                await sync_to_async(txn.save)()
                print("Webhook: transaction cancelled ->", txn.id)

        elif event_type == "payment_intent.payment_failed":
            payment_intent_obj = event["data"]["object"]
            payment_intent = payment_intent_obj.to_dict()
            payment_intent_id = payment_intent.get("id")

            txn = await sync_to_async(
                lambda: PaymentTransaction.objects.filter(
                    stripe_payment_intent_id=payment_intent_id
                ).first()
            )()

            if txn:
                txn.status = "failed"
                txn.access_granted = False
                await sync_to_async(txn.save)()
                print("Webhook: transaction failed ->", txn.id)

    except Exception as e:
        print("WEBHOOK ERROR:", repr(e))
        return JSONResponse(
            {"received": False, "error": str(e)},
            status_code=500,
        )

    return JSONResponse({"received": True})