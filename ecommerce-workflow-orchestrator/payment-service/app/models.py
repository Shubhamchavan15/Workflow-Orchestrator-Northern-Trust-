from pydantic import BaseModel
from typing import Optional

class PaymentRequest(BaseModel):
    order_id: str
    amount: float
    currency: str = "INR"
    customer_id: str
    simulate_failure: bool = False  # for demo purposes

class PaymentResponse(BaseModel):
    success: bool
    order_id: str
    transaction_id: Optional[str] = None
    message: str
    status: str  # "charged" | "declined" | "error" 
