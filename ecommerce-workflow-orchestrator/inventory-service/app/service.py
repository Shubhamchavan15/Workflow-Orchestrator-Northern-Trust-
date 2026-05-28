 
from .models import InventoryRequest, InventoryResponse

# Mock in-memory stock (replace with DB if time allows)
STOCK = {
    "PROD-001": 50,
    "PROD-002": 5,
    "PROD-003": 0,   # always out of stock
}

def check_inventory(req: InventoryRequest) -> InventoryResponse:

    # Demo failure trigger
    if req.simulate_out_of_stock:
        return InventoryResponse(
            success=False,
            order_id=req.order_id,
            reserved=False,
            message="Item out of stock — back-order triggered",
            status="out_of_stock"
        )

    # Check each item
    for item in req.items:
        available = STOCK.get(item.product_id, 0)
        if available < item.quantity:
            return InventoryResponse(
                success=False,
                order_id=req.order_id,
                reserved=False,
                message=f"{item.product_id} has only {available} units",
                status="out_of_stock"
            )

    # Reserve stock (deduct from mock store)
    for item in req.items:
        STOCK[item.product_id] -= item.quantity

    return InventoryResponse(
        success=True,
        order_id=req.order_id,
        reserved=True,
        message="All items reserved successfully",
        status="reserved"
    )