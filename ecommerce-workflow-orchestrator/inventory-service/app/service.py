from .models import InventoryRequest, InventoryResponse

# Generous stock levels — all products always available for demo
# Only fails when simulate_out_of_stock flag is ticked
STOCK = {
    "PROD-001": 999,
    "PROD-002": 999,
    "PROD-003": 999,
    "PROD-004": 999,
    "PROD-005": 999,
    "PROD-006": 999,
    "PROD-007": 999,
    "PROD-008": 999,
    "PROD-009": 999,
    "PROD-010": 999,
    "PROD-011": 999,
    "PROD-012": 999,
}

def check_inventory(req: InventoryRequest) -> InventoryResponse:

    # Only fail when the checkbox is ticked in the User Portal
    if req.simulate_out_of_stock:
        return InventoryResponse(
            success=False,
            order_id=req.order_id,
            reserved=False,
            message="Item out of stock — back-order triggered",
            status="out_of_stock"
        )

    # Check each item against stock (always passes for demo products)
    for item in req.items:
        available = STOCK.get(item.product_id, 999)
        if available < item.quantity:
            return InventoryResponse(
                success=False,
                order_id=req.order_id,
                reserved=False,
                message=f"{item.product_id} has only {available} units available",
                status="out_of_stock"
            )

    return InventoryResponse(
        success=True,
        order_id=req.order_id,
        reserved=True,
        message="All items reserved successfully",
        status="reserved"
    )
