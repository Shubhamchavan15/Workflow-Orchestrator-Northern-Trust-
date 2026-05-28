import json


class WorkflowParser:

    @staticmethod
    def load_workflow(path):
        with open(path, "r") as file:
            data = json.load(file)

        tasks = {}

        for task in data["tasks"]:
            tasks[task["id"]] = task

        return {
            "name": data["workflow_name"],
            "tasks": tasks
        }