from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import ShippingRequest, ShippingResponse
from .service import dispatch_shipment

app = FastAPI(title="Shipping Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
    allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health():
    return {"service": "shipping", "status": "ok"}

@app.post("/dispatch", response_model=ShippingResponse)
def dispatch(req: ShippingRequest):
    return dispatch_shipment(req) 
