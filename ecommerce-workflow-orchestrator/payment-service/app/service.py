import uuid
import random
from .models import PaymentRequest, PaymentResponse

def process_payment(req: PaymentRequest) -> PaymentResponse:

    # Simulate failure when requested (for demo)
    if req.simulate_failure:
        return PaymentResponse(
            success=False,
            order_id=req.order_id,
            transaction_id=None,
            message="Card declined — insufficient funds",
            status="declined"
        )

    # Simulate high-value order check
    if req.amount > 10000:
        return PaymentResponse(
            success=False,
            order_id=req.order_id,
            transaction_id=None,
            message="High-value order — awaiting manual approval",
            status="pending_approval"
        )

    # Normal success
    txn_id = "TXN-" + str(uuid.uuid4())[:8].upper()
    return PaymentResponse(
        success=True,
        order_id=req.order_id,
        transaction_id=txn_id,
        message=f"Payment of {req.currency} {req.amount} charged",
        status="charged"
    ) 
