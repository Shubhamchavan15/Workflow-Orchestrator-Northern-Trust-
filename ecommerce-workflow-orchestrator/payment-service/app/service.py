import uuid
import random
from .models import PaymentRequest, PaymentResponse

# Failure scenarios used for random simulation
FAILURE_SCENARIOS = [
    ("Card declined — insufficient funds",       "declined"),
    ("Card declined — suspected fraud",          "declined"),
    ("Payment gateway timeout",                  "error"),
    ("Invalid card number",                      "declined"),
    ("Transaction limit exceeded",               "declined"),
]

def process_payment(req: PaymentRequest) -> PaymentResponse:

    # Explicit simulate_failure flag (from manual trigger or test)
    if req.simulate_failure:
        message, status = random.choice(FAILURE_SCENARIOS)
        return PaymentResponse(
            success=False,
            order_id=req.order_id,
            transaction_id=None,
            message=message,
            status=status
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

    # Random 30% failure rate to simulate real-world payment failures
    if random.random() < 0.30:
        message, status = random.choice(FAILURE_SCENARIOS)
        return PaymentResponse(
            success=False,
            order_id=req.order_id,
            transaction_id=None,
            message=f"[Auto-simulated] {message}",
            status=status
        )

    # Normal success
    txn_id = "TXN-" + str(uuid.uuid4())[:8].upper()
    return PaymentResponse(
        success=True,
        order_id=req.order_id,
        transaction_id=txn_id,
        message=f"Payment of {req.currency} {req.amount} charged successfully",
        status="charged"
    ) 
