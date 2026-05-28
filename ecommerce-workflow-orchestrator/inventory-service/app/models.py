from pydantic import BaseModel
from typing import Optional, List

class InventoryItem(BaseModel):
    product_id: str
    quantity: int

class InventoryRequest(BaseModel):
    order_id: str
    items: List[InventoryItem]
    simulate_out_of_stock: bool = False  # for demo

class InventoryResponse(BaseModel):
    success: bool
    order_id: str
    reserved: bool
    message: str
    status: str  # "reserved" | "out_of_stock" | "partial" 
