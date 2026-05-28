"""
Workflow Routes — trigger and manage workflow executions.
"""
import os
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional

from app.orchestrator.engine import WorkflowEngine
from app.database.postgres import (
    get_executions_collection,
    get_logs_collection,
    get_alerts_collection,
)

router = APIRouter(prefix="/workflows", tags=["Workflows"])

WORKFLOW_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "workflows", "order_workflow.json"
)


# ------------------------------------------------------------------ #
#  Request / Response models                                           #
# ------------------------------------------------------------------ #

class OrderItem(BaseModel):
    product_id: str
    quantity: int = 1


class TriggerWorkflowRequest(BaseModel):
    order_id:       str
    customer_id:    str
    customer_name:  str
    customer_email: str
    amount:         float
    currency:       str = "INR"
    items:          List[OrderItem] = Field(default_factory=list)
    address:        str = "123 Main St"
    city:           str = "Mumbai"
    pincode:        str = "400001"
    weight_kg:      float = 1.0
    # Demo flags
    simulate_payment_failure: bool = False
    simulate_out_of_stock:    bool = False


# ------------------------------------------------------------------ #
#  Endpoints                                                           #
# ------------------------------------------------------------------ #

@router.post("/trigger")
def trigger_workflow(req: TriggerWorkflowRequest, background_tasks: BackgroundTasks):
    """
    Trigger a new order workflow execution.
    The heavy lifting runs in a background task so the API returns immediately.
    """
    import uuid
    execution_id = "EX-" + str(uuid.uuid4())[:8].upper()

    order_data = req.model_dump()
    order_data["items"] = [item.model_dump() for item in req.items]

    background_tasks.add_task(
        _run_workflow_bg,
        execution_id=execution_id,
        order_data=order_data,
    )

    return {
        "message":      "Workflow triggered",
        "execution_id": execution_id,
        "order_id":     req.order_id,
        "status":       "RUNNING",
    }


def _run_workflow_bg(execution_id: str, order_data: dict):
    """Background task that actually runs the workflow engine."""
    engine = WorkflowEngine()
    try:
        engine.run_workflow(
            workflow_path=WORKFLOW_PATH,
            order_data=order_data,
            execution_id=execution_id,
        )
    except Exception as e:
        print(f"[BG] Workflow {execution_id} crashed: {e}")


@router.get("/executions")
def list_executions(limit: int = 50):
    """Return recent workflow executions."""
    col = get_executions_collection()
    docs = list(col.find({}, {"_id": 0}).sort("created_at", -1).limit(limit))
    return {"executions": docs}


@router.get("/executions/{execution_id}")
def get_execution(execution_id: str):
    """Return a single execution record."""
    col = get_executions_collection()
    doc = col.find_one({"execution_id": execution_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Execution not found")
    return doc


@router.get("/executions/{execution_id}/logs")
def get_execution_logs(execution_id: str):
    """Return all logs for a given execution."""
    col = get_logs_collection()
    logs = list(
        col.find({"execution_id": execution_id}, {"_id": 0})
        .sort("timestamp", 1)
    )
    return {"execution_id": execution_id, "logs": logs}


@router.get("/alerts")
def list_alerts(resolved: Optional[bool] = None, limit: int = 50):
    """Return workflow alerts, optionally filtered by resolved status."""
    col = get_alerts_collection()
    query = {}
    if resolved is not None:
        query["resolved"] = resolved
    docs = list(col.find(query, {"_id": 0}).sort("created_at", -1).limit(limit))
    return {"alerts": docs}


@router.patch("/alerts/{execution_id}/resolve")
def resolve_alert(execution_id: str):
    """Mark an alert as resolved."""
    col = get_alerts_collection()
    result = col.update_one(
        {"execution_id": execution_id},
        {"$set": {"resolved": True}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert resolved"}
