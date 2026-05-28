from app.orchestrator.engine import WorkflowEngine

engine = WorkflowEngine()

engine.run_workflow(
    "workflows/order_workflow.json"
)

print("\nFINAL STATES:")

print(engine.state_manager.get_all_states())