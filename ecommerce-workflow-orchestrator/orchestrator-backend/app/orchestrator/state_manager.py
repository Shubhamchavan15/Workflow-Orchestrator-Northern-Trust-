class StateManager:

    def __init__(self):
        self.task_states = {}

    def set_state(self, task_id, state):
        self.task_states[task_id] = state

    def get_state(self, task_id):
        return self.task_states.get(task_id, "PENDING")

    def get_all_states(self):
        return self.task_states