"""
Dashboard Routes — aggregated stats for the admin dashboard.
"""
from fastapi import APIRouter
from app.database.postgres import (
    get_executions_collection,
    get_logs_collection,
    get_alerts_collection,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_stats():
    """
    Return high-level counts: total, running, completed, failed workflows.
    """
    col = get_executions_collection()

    total     = col.count_documents({})
    running   = col.count_documents({"status": "RUNNING"})
    completed = col.count_documents({"status": "COMPLETED"})
    failed    = col.count_documents({"status": "FAILED"})

    return {
        "total_workflows": total,
        "running":         running,
        "completed":       completed,
        "failed":          failed,
    }


@router.get("/recent-activity")
def recent_activity(limit: int = 10):
    """
    Return the most recent log entries across all executions.
    """
    col = get_logs_collection()
    logs = list(
        col.find({}, {"_id": 0})
        .sort("timestamp", -1)
        .limit(limit)
    )
    return {"activity": logs}


@router.get("/service-health")
def service_health():
    """
    Return per-service task success/failure counts derived from execution records.
    """
    col = get_executions_collection()
    pipeline = [
        {"$project": {"task_states": 1}},
        {"$project": {
            "tasks": {"$objectToArray": "$task_states"}
        }},
        {"$unwind": "$tasks"},
        {"$group": {
            "_id":     "$tasks.k",
            "total":   {"$sum": 1},
            "success": {"$sum": {"$cond": [{"$eq": ["$tasks.v", "COMPLETED"]}, 1, 0]}},
            "failed":  {"$sum": {"$cond": [{"$eq": ["$tasks.v", "FAILED"]},    1, 0]}},
        }},
    ]
    results = list(col.aggregate(pipeline))
    services = []
    for r in results:
        total   = r["total"]
        success = r["success"]
        rate    = round((success / total) * 100, 1) if total > 0 else 0
        services.append({
            "name":         r["_id"],
            "total":        total,
            "success":      success,
            "failed":       r["failed"],
            "success_rate": f"{rate}%",
            "status":       "Healthy" if rate >= 90 else ("Warning" if rate >= 70 else "Failed"),
        })
    return {"services": services}


@router.get("/workflow-chart")
def workflow_chart():
    """
    Return data for the pie/bar chart on the dashboard.
    """
    col = get_executions_collection()
    running   = col.count_documents({"status": "RUNNING"})
    completed = col.count_documents({"status": "COMPLETED"})
    failed    = col.count_documents({"status": "FAILED"})

    return {
        "chart_data": [
            {"name": "Running",   "value": running},
            {"name": "Completed", "value": completed},
            {"name": "Failed",    "value": failed},
        ]
    }
