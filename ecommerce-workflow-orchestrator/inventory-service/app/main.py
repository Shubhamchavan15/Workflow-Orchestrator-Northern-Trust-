from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import InventoryRequest, InventoryResponse
from .service import check_inventory

app = FastAPI(title="Inventory Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
    allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health():
    return {"service": "inventory", "status": "ok"}

@app.post("/check", response_model=InventoryResponse)
def check(req: InventoryRequest):
    return check_inventory(req) 
