from .models import NotificationRequest, NotificationResponse

TEMPLATES = {
    "order_confirmed": (
        "Dear {name}, your order {oid} has been confirmed and is being processed! "
        "You will receive a shipping update soon."
    ),
    "payment_failed": (
        "Dear {name}, we were unable to process the payment for your order {oid}. "
        "Please check your payment details and try again. "
        "If the issue persists, contact support."
    ),
    "shipped": (
        "Dear {name}, great news! Your order {oid} has been shipped. "
        "Track your package using tracking ID: {trk}"
    ),
}

def send_notification(req: NotificationRequest) -> NotificationResponse:

    template = TEMPLATES.get(req.notification_type, "Update on your order {oid}.")

    body = template.format(
        name=req.customer_name,
        oid=req.order_id,
        trk=req.tracking_id or "N/A",
    )

    # If a custom message was passed (e.g. from failure handler), append it
    if req.message and req.notification_type == "payment_failed":
        body = req.message

    # Mock delivery — in production replace with SendGrid / Twilio / SES
    print(f"[NOTIFICATION] ── New Notification ──────────────────────")
    print(f"[NOTIFICATION] Type    : {req.notification_type}")
    print(f"[NOTIFICATION] To      : {req.customer_email}")
    print(f"[NOTIFICATION] Order   : {req.order_id}")
    print(f"[NOTIFICATION] Message : {body}")
    print(f"[NOTIFICATION] ─────────────────────────────────────────")

    return NotificationResponse(
        success=True,
        order_id=req.order_id,
        channel="email",
        delivered=True,
        message=f"Notification ({req.notification_type}) sent to {req.customer_email}",
    )
