from concurrent.futures import ThreadPoolExecutor

from app.orchestrator.parser import WorkflowParser
from app.orchestrator.executor import TaskExecutor
from app.orchestrator.retry_manager import RetryManager
from app.orchestrator.state_manager import StateManager


class WorkflowEngine:

    def __init__(self):

        self.executor = TaskExecutor()
        self.retry_manager = RetryManager()
        self.state_manager = StateManager()

    def run_workflow(self, workflow_path):

        workflow = WorkflowParser.load_workflow(workflow_path)

        tasks = workflow["tasks"]

        completed = set()

        start_task = None

        for task_id, task in tasks.items():
            if task["type"] == "start":
                start_task = task_id
                break

        self.execute_task(start_task, tasks, completed)

    def execute_task(self, task_id, tasks, completed):

        if task_id in completed:
            return

        task = tasks[task_id]

        self.state_manager.set_state(task_id, "RUNNING")

        try:

            self.retry_manager.retry(
                self.executor.execute,
                task
            )

            self.state_manager.set_state(task_id, "COMPLETED")

            completed.add(task_id)

            next_tasks = task.get("next", [])

            if len(next_tasks) > 1:

                with ThreadPoolExecutor() as executor:

                    futures = []

                    for next_task in next_tasks:
                        futures.append(
                            executor.submit(
                                self.execute_task,
                                next_task,
                                tasks,
                                completed
                            )
                        )

                    for future in futures:
                        future.result()

            else:

                for next_task in next_tasks:
                    self.execute_task(
                        next_task,
                        tasks,
                        completed
                    )

        except Exception as e:

            self.state_manager.set_state(task_id, "FAILED")

            print(f"Task failed: {task_id}")
            print(e)