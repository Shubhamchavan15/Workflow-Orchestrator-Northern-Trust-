 
from pydantic import BaseModel
from typing import Optional

class ShippingRequest(BaseModel):
    order_id: str
    customer_name: str
    address: str
    city: str
    pincode: str
    weight_kg: float = 1.0

class ShippingResponse(BaseModel):
    success: bool
    order_id: str
    tracking_id: Optional[str] = None
    courier: Optional[str] = None
    estimated_days: Optional[int] = None
    message: str
    status: str  # "dispatched" | "failed"