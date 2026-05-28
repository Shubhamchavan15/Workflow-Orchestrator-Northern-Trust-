from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import NotificationRequest, NotificationResponse
from .service import send_notification

app = FastAPI(title="Notification Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
    allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health():
    return {"service": "notification", "status": "ok"}

@app.post("/send", response_model=NotificationResponse)
def send(req: NotificationRequest):
    return send_notification(req) 
