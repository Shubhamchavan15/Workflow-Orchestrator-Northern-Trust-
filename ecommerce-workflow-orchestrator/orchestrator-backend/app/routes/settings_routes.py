"""
Settings Routes — save/load admin settings and send test notifications.
"""
import os
import requests
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.database.postgres import get_settings_collection

router = APIRouter(prefix="/settings", tags=["Settings"])

NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL", "http://localhost:8004/send")


class SettingsPayload(BaseModel):
    notification_email: Optional[str] = ""
    max_retries:        Optional[int] = 3
    slack_enabled:      Optional[bool] = False


# ── GET current settings ──────────────────────────────────────────

@router.get("")
def get_settings():
    col = get_settings_collection()
    doc = col.find_one({"settings_key": "admin_settings"}) or {}
    return {
        "notification_email": doc.get("notification_email", ""),
        "max_retries":        doc.get("max_retries", 3),
        "slack_enabled":      doc.get("slack_enabled", False),
    }


# ── SAVE settings ─────────────────────────────────────────────────

@router.post("")
def save_settings(payload: SettingsPayload):
    col = get_settings_collection()
    col.update_one(
        {"settings_key": "admin_settings"},
        {"$set": {
            "notification_email": payload.notification_email,
            "max_retries":        payload.max_retries,
            "slack_enabled":      payload.slack_enabled,
        }},
        upsert=True,
    )
    return {"message": "Settings saved successfully"}


# ── SEND test email ───────────────────────────────────────────────

@router.post("/test-email")
def send_test_email(payload: SettingsPayload):
    email = payload.notification_email
    if not email:
        return {"success": False, "message": "No email address provided"}

    try:
        resp = requests.post(
            NOTIFICATION_SERVICE_URL,
            json={
                "order_id":          "TEST-0000",
                "customer_email":    email,
                "customer_name":     "Admin",
                "notification_type": "order_confirmed",
                "message": (
                    f"Hello! This is a test notification from the Workflow Orchestrator. "
                    f"Alerts for payment failures and workflow errors will be sent to {email}."
                ),
            },
            timeout=30,
        )
        result = resp.json()
        return {"success": True, "message": f"Test email sent to {email}"}
    except Exception as e:
        return {"success": False, "message": f"Failed to reach notification service: {e}"}
