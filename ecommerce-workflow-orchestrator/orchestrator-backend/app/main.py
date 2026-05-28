"""
Orchestrator Backend — FastAPI application entry point.
"""
from dotenv import load_dotenv
load_dotenv()  # loads .env so service URLs are available

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.workflow_routes  import router as workflow_router
from app.routes.dashboard_routes import router as dashboard_router

app = FastAPI(
    title="Ecommerce Workflow Orchestrator",
    description="DAG-based workflow engine for ecommerce order processing",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workflow_router)
app.include_router(dashboard_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "orchestrator-backend"}


@app.get("/")
def root():
    return {
        "message": "Ecommerce Workflow Orchestrator API",
        "docs":    "/docs",
    }
