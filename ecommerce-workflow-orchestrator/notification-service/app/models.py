from pydantic import BaseModel
from typing import Optional

class NotificationRequest(BaseModel):
    order_id: str
    customer_email: str
    customer_name: str
    notification_type: str  # "order_confirmed" | "payment_failed" | "shipped"
    tracking_id: Optional[str] = None
    message: Optional[str] = None

class NotificationResponse(BaseModel):
    success: bool
    order_id: str
    channel: str   # "email" | "sms"
    delivered: bool
    message: str 
