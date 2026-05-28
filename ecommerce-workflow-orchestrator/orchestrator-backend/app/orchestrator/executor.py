import time
import random


class TaskExecutor:

    def execute(self, task):

        print(f"Executing task: {task['id']}")

        time.sleep(2)

        # Simulate random failure
        if random.randint(1, 10) < 2:
            raise Exception("Random task failure")

        print(f"Completed task: {task['id']}")

        return True