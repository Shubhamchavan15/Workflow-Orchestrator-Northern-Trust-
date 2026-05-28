"""
WorkflowEngine — DAG-based execution engine with parallel branch support,
retry logic, state persistence, and real HTTP microservice calls.
"""
import datetime
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed

from app.orchestrator.parser       import WorkflowParser
from app.orchestrator.executor     import TaskExecutor
from app.orchestrator.retry_manager import RetryManager
from app.orchestrator.state_manager import StateManager
from app.database.postgres          import get_executions_collection, get_alerts_collection


class WorkflowEngine:

    def __init__(self, retries: int = 3, retry_delay: float = 2.0):
        self.executor      = TaskExecutor()
        self.retry_manager = RetryManager(retries=retries, delay=retry_delay)

    # ------------------------------------------------------------------ #
    #  Public entry point                                                  #
    # ------------------------------------------------------------------ #

    def run_workflow(
        self,
        workflow_path: str,
        order_data: dict = None,
        execution_id: str = None,
    ) -> dict:
        """
        Load a workflow JSON, execute all tasks in DAG order, and return
        a summary dict with execution_id, final status, and task states.
        """
        execution_id = execution_id or ("EX-" + str(uuid.uuid4())[:8].upper())
        order_data   = order_data or {}

        state_manager = StateManager(execution_id=execution_id)

        # Persist initial execution record
        self._init_execution_record(execution_id, order_data)
        state_manager.append_log(f"Workflow execution started. execution_id={execution_id}")

        workflow = WorkflowParser.load_workflow(workflow_path)
        tasks    = workflow["tasks"]

        # Find the start node
        start_task = next(
            (tid for tid, t in tasks.items() if t["type"] == "start"),
            None,
        )
        if not start_task:
            raise ValueError("Workflow has no 'start' task")

        completed  = set()
        final_status = "COMPLETED"

        try:
            self._execute_task(
                start_task, tasks, completed,
                state_manager, order_data,
            )
        except Exception as exc:
            final_status = "FAILED"
            state_manager.append_log(f"Workflow FAILED: {exc}")
            self._raise_alert(execution_id, str(exc), order_data)

        # Persist final status
        self._finalize_execution(execution_id, final_status, state_manager.get_all_states())
        state_manager.append_log(f"Workflow execution finished with status: {final_status}")

        return {
            "execution_id": execution_id,
            "status":       final_status,
            "task_states":  state_manager.get_all_states(),
        }

    # ------------------------------------------------------------------ #
    #  Internal DAG traversal                                              #
    # ------------------------------------------------------------------ #

    def _execute_task(
        self,
        task_id: str,
        tasks: dict,
        completed: set,
        state_manager: StateManager,
        order_data: dict,
    ):
        if task_id in completed:
            return

        task = tasks[task_id]
        state_manager.set_state(task_id, "RUNNING")
        state_manager.append_log(f"Task '{task_id}' started")

        try:
            result = self.retry_manager.retry(
                self.executor.execute,
                task,
                order_data,
            )

            # Carry tracking_id forward for notification step
            if task_id == "shipping" and isinstance(result, dict):
                order_data["tracking_id"] = result.get("tracking_id")

            state_manager.set_state(task_id, "COMPLETED")
            state_manager.append_log(f"Task '{task_id}' completed successfully")
            completed.add(task_id)

        except Exception as exc:
            state_manager.set_state(task_id, "FAILED")
            state_manager.append_log(f"Task '{task_id}' FAILED after retries: {exc}")
            raise

        # ---- schedule next tasks ----------------------------------------
        next_tasks = task.get("next", [])

        if len(next_tasks) > 1:
            # Parallel branches (e.g. shipping + notification after inventory)
            with ThreadPoolExecutor(max_workers=len(next_tasks)) as pool:
                futures = {
                    pool.submit(
                        self._execute_task,
                        nt, tasks, completed, state_manager, order_data,
                    ): nt
                    for nt in next_tasks
                }
                for future in as_completed(futures):
                    future.result()   # re-raise any exception
        else:
            for nt in next_tasks:
                self._execute_task(nt, tasks, completed, state_manager, order_data)

    # ------------------------------------------------------------------ #
    #  MongoDB helpers                                                     #
    # ------------------------------------------------------------------ #

    def _init_execution_record(self, execution_id: str, order_data: dict):
        try:
            col = get_executions_collection()
            col.insert_one(
                {
                    "execution_id": execution_id,
                    "order_id":     order_data.get("order_id", "UNKNOWN"),
                    "customer_name": order_data.get("customer_name", ""),
                    "customer_email": order_data.get("customer_email", ""),
                    "amount":       order_data.get("amount", 0),
                    "status":       "RUNNING",
                    "task_states":  {},
                    "created_at":   datetime.datetime.utcnow().isoformat(),
                    "updated_at":   datetime.datetime.utcnow().isoformat(),
                }
            )
        except Exception as e:
            print(f"[Engine] Failed to init execution record: {e}")

    def _finalize_execution(self, execution_id: str, status: str, task_states: dict):
        try:
            col = get_executions_collection()
            col.update_one(
                {"execution_id": execution_id},
                {
                    "$set": {
                        "status":       status,
                        "task_states":  task_states,
                        "completed_at": datetime.datetime.utcnow().isoformat(),
                        "updated_at":   datetime.datetime.utcnow().isoformat(),
                    }
                },
            )
        except Exception as e:
            print(f"[Engine] Failed to finalize execution record: {e}")

    def _raise_alert(self, execution_id: str, error_msg: str, order_data: dict):
        try:
            col = get_alerts_collection()
            col.insert_one(
                {
                    "execution_id": execution_id,
                    "order_id":     order_data.get("order_id", "UNKNOWN"),
                    "severity":     "Critical",
                    "title":        f"Workflow {execution_id} failed",
                    "message":      error_msg,
                    "created_at":   datetime.datetime.utcnow().isoformat(),
                    "resolved":     False,
                }
            )
        except Exception as e:
            print(f"[Engine] Failed to write alert: {e}")
