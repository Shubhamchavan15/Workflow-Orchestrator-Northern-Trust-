"""
StateManager — tracks task states in memory AND persists them to MongoDB.
"""
import datetime
from app.database.postgres import get_executions_collection, get_logs_collection


class StateManager:

    def __init__(self, execution_id: str = None):
        self.task_states: dict = {}
        self.execution_id = execution_id

    # ------------------------------------------------------------------ #
    #  In-memory helpers                                                   #
    # ------------------------------------------------------------------ #

    def set_state(self, task_id: str, state: str):
        self.task_states[task_id] = state
        if self.execution_id:
            self._persist_state(task_id, state)

    def get_state(self, task_id: str) -> str:
        return self.task_states.get(task_id, "PENDING")

    def get_all_states(self) -> dict:
        return self.task_states

    # ------------------------------------------------------------------ #
    #  MongoDB persistence                                                 #
    # ------------------------------------------------------------------ #

    def _persist_state(self, task_id: str, state: str):
        try:
            col = get_executions_collection()
            col.update_one(
                {"execution_id": self.execution_id},
                {
                    "$set": {
                        f"task_states.{task_id}": state,
                        "updated_at": datetime.datetime.utcnow().isoformat(),
                    }
                },
                upsert=True,
            )
        except Exception as e:
            print(f"[StateManager] DB write failed: {e}")

    def append_log(self, message: str):
        if not self.execution_id:
            return
        try:
            col = get_logs_collection()
            col.insert_one(
                {
                    "execution_id": self.execution_id,
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "message": message,
                }
            )
        except Exception as e:
            print(f"[StateManager] Log write failed: {e}")
