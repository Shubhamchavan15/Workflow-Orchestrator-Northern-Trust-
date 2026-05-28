from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import PaymentRequest, PaymentResponse
from .service import process_payment

app = FastAPI(title="Payment Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
    allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health():
    return {"service": "payment", "status": "ok"}

@app.post("/process", response_model=PaymentResponse)
def process(req: PaymentRequest):
    return process_payment(req) 
