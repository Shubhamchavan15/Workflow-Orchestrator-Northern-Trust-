import uuid
import random
from .models import PaymentRequest, PaymentResponse

FAILURE_SCENARIOS = [
    ("Card declined — insufficient funds",  "declined"),
    ("Card declined — suspected fraud",     "declined"),
    ("Payment gateway timeout",             "error"),
    ("Invalid card number",                 "declined"),
    ("Transaction limit exceeded",          "declined"),
]

def process_payment(req: PaymentRequest) -> PaymentResponse:

    # Only fail when the checkbox is ticked in the User Portal
    if req.simulate_failure:
        message, status = random.choice(FAILURE_SCENARIOS)
        return PaymentResponse(
            success=False,
            order_id=req.order_id,
            transaction_id=None,
            message=message,
            status=status
        )

    # High-value order check (> ₹10,000)
    if req.amount > 10000:
        return PaymentResponse(
            success=False,
            order_id=req.order_id,
            transaction_id=None,
            message="High-value order — awaiting manual approval",
            status="pending_approval"
        )

    # Always succeed for normal orders
    txn_id = "TXN-" + str(uuid.uuid4())[:8].upper()
    return PaymentResponse(
        success=True,
        order_id=req.order_id,
        transaction_id=txn_id,
        message=f"Payment of {req.currency} {req.amount} charged successfully",
        status="charged"
    )
