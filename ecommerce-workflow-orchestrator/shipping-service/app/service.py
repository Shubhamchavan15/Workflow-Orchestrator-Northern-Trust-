 
import uuid
from .models import ShippingRequest, ShippingResponse

COURIERS = ["BlueDart", "Delhivery", "Ecom Express"]

def dispatch_shipment(req: ShippingRequest) -> ShippingResponse:

    # Assign courier based on pincode prefix (mock logic)
    pin_prefix = req.pincode[:2]
    courier = COURIERS[int(pin_prefix) % len(COURIERS)]

    tracking_id = "TRK-" + str(uuid.uuid4())[:10].upper()

    # Estimate delivery days by weight
    days = 2 if req.weight_kg <= 2 else 5

    return ShippingResponse(
        success=True,
        order_id=req.order_id,
        tracking_id=tracking_id,
        courier=courier,
        estimated_days=days,
        message=f"Dispatched via {courier}. Tracking: {tracking_id}",
        status="dispatched"
    )