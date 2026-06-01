import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from dotenv import load_dotenv
from .models import NotificationRequest, NotificationResponse

# Load .env from the notification-service root (one level up from app/)
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

# ── SMTP config ────────────────────────────────────────────────────
SMTP_HOST     = os.getenv("SMTP_HOST",     "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER     = os.getenv("SMTP_USER",     "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM     = os.getenv("SMTP_FROM",     SMTP_USER)

# Startup confirmation
print(f"[NOTIFICATION] SMTP configured: user={SMTP_USER or '⚠️ NOT SET'}, host={SMTP_HOST}:{SMTP_PORT}")

# ── Email templates ────────────────────────────────────────────────
SUBJECTS = {
    "order_confirmed": "✅ Order Confirmed — {oid}",
    "payment_failed":  "❌ Payment Failed — {oid}",
    "shipped":         "🚚 Your Order Has Shipped — {oid}",
}

HTML_TEMPLATES = {
    "order_confirmed": """
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
  <h2 style="color:#16a34a;">✅ Order Confirmed</h2>
  <p>Dear <strong>{name}</strong>,</p>
  <p>Your order <strong>{oid}</strong> has been confirmed and is being processed.</p>
  <p>You will receive a shipping update soon.</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
  <p style="color:#6b7280;font-size:12px;">Ecommerce Workflow Orchestrator · Northern Trust Demo</p>
</div>
""",
    "payment_failed": """
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #fca5a5;border-radius:12px;background:#fff7f7;">
  <h2 style="color:#dc2626;">❌ Payment Failed</h2>
  <p>Dear <strong>{name}</strong>,</p>
  <p>We were unable to process the payment for your order <strong>{oid}</strong>.</p>
  <p style="background:#fee2e2;padding:12px;border-radius:8px;color:#b91c1c;">{custom_message}</p>
  <p>Please check your payment details and try again, or contact support.</p>
  <hr style="border:none;border-top:1px solid #fca5a5;margin:20px 0;">
  <p style="color:#6b7280;font-size:12px;">Ecommerce Workflow Orchestrator · Northern Trust Demo</p>
</div>
""",
    "shipped": """
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
  <h2 style="color:#2563eb;">🚚 Your Order Has Shipped</h2>
  <p>Dear <strong>{name}</strong>,</p>
  <p>Great news! Your order <strong>{oid}</strong> has been shipped.</p>
  <p>Tracking ID: <strong>{trk}</strong></p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
  <p style="color:#6b7280;font-size:12px;">Ecommerce Workflow Orchestrator · Northern Trust Demo</p>
</div>
""",
}


def _send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send an HTML email via SMTP. Returns True on success."""
    if not SMTP_USER or not SMTP_PASSWORD:
        print("[NOTIFICATION] ⚠️  SMTP_USER / SMTP_PASSWORD not set — email not sent.")
        print(f"[NOTIFICATION] Would have sent to: {to_email}")
        print(f"[NOTIFICATION] Subject: {subject}")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = SMTP_FROM
        msg["To"]      = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, to_email, msg.as_string())

        print(f"[NOTIFICATION] ✅ Email sent to {to_email} | Subject: {subject}")
        return True

    except Exception as e:
        print(f"[NOTIFICATION] ❌ Failed to send email to {to_email}: {e}")
        return False


def send_notification(req: NotificationRequest) -> NotificationResponse:
    ntype = req.notification_type

    # Build subject
    subject = SUBJECTS.get(ntype, "Update on your order {oid}").format(oid=req.order_id)

    # Build HTML body
    template = HTML_TEMPLATES.get(ntype, "<p>{custom_message}</p>")
    html_body = template.format(
        name=req.customer_name,
        oid=req.order_id,
        trk=req.tracking_id or "N/A",
        custom_message=req.message or "",
    )

    # Log to terminal always
    print(f"[NOTIFICATION] ── {ntype.upper()} ──────────────────────────────")
    print(f"[NOTIFICATION] To      : {req.customer_email}")
    print(f"[NOTIFICATION] Order   : {req.order_id}")
    print(f"[NOTIFICATION] Message : {req.message or subject}")
    print(f"[NOTIFICATION] ─────────────────────────────────────────────────")

    # Send email in background thread so HTTP response returns immediately
    import threading
    threading.Thread(
        target=_send_email,
        args=(req.customer_email, subject, html_body),
        daemon=True
    ).start()

    return NotificationResponse(
        success=True,
        order_id=req.order_id,
        channel="email",
        delivered=True,
        message=f"Notification queued for {req.customer_email}",
    )
