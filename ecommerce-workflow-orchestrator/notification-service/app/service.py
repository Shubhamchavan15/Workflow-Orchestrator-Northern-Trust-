from .models import NotificationRequest, NotificationResponse

TEMPLATES = {
    "order_confirmed": "Dear {name}, your order {oid} is confirmed!",
    "payment_failed":  "Dear {name}, payment for order {oid} failed.",
    "shipped":         "Dear {name}, order {oid} shipped. Track: {trk}",
}

def send_notification(req: NotificationRequest) -> NotificationResponse:

    template = TEMPLATES.get(req.notification_type,
        "Update on your order {oid}")

    body = template.format(
        name=req.customer_name,
        oid=req.order_id,
        trk=req.tracking_id or "N/A"
    )

    # Mock delivery — in real life call SendGrid / Twilio here
    print(f"[NOTIFICATION] To: {req.customer_email}")
    print(f"[NOTIFICATION] Body: {body}")

    return NotificationResponse(
        success=True,
        order_id=req.order_id,
        channel="email",
        delivered=True,
        message=f"Notification sent to {req.customer_email}"
    ) 
