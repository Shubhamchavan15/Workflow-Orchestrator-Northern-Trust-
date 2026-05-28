"""
In-memory data store with JSON file persistence.
No MongoDB or any external database required.
Data is saved to data/ folder next to this file so it survives restarts.
"""
import os
import json
import threading
from pathlib import Path

# ── storage directory ──────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent.parent / "data"
BASE_DIR.mkdir(exist_ok=True)

EXEC_FILE   = BASE_DIR / "executions.json"
LOGS_FILE   = BASE_DIR / "logs.json"
ALERTS_FILE = BASE_DIR / "alerts.json"

_lock = threading.Lock()


# ── helpers ────────────────────────────────────────────────────────

def _load(path: Path) -> list:
    if path.exists():
        try:
            with open(path, "r") as f:
                return json.load(f)
        except Exception:
            return []
    return []


def _save(path: Path, data: list):
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)


# ── Collection-like wrapper ────────────────────────────────────────

class _Collection:
    def __init__(self, path: Path):
        self._path = path

    def _read(self) -> list:
        return _load(self._path)

    def _write(self, data: list):
        _save(self._path, data)

    def insert_one(self, doc: dict):
        with _lock:
            data = self._read()
            data.append(doc)
            self._write(data)

    def find(self, query: dict = None, projection: dict = None):
        data = self._read()
        results = [d for d in data if self._match(d, query or {})]
        # sort support: caller chains .sort() — we return a _Cursor
        return _Cursor(results)

    def find_one(self, query: dict, projection: dict = None):
        data = self._read()
        for doc in data:
            if self._match(doc, query):
                return doc
        return None

    def update_one(self, query: dict, update: dict, upsert: bool = False):
        with _lock:
            data   = self._read()
            found  = False
            for doc in data:
                if self._match(doc, query):
                    set_vals = update.get("$set", {})
                    for k, v in set_vals.items():
                        # support dot-notation: "task_states.payment" → nested
                        keys = k.split(".")
                        target = doc
                        for key in keys[:-1]:
                            target = target.setdefault(key, {})
                        target[keys[-1]] = v
                    found = True
                    break
            if not found and upsert:
                new_doc = {**query}
                for k, v in update.get("$set", {}).items():
                    keys = k.split(".")
                    target = new_doc
                    for key in keys[:-1]:
                        target = target.setdefault(key, {})
                    target[keys[-1]] = v
                data.append(new_doc)
            self._write(data)

    def count_documents(self, query: dict = None) -> int:
        data = self._read()
        return sum(1 for d in data if self._match(d, query or {}))

    def aggregate(self, pipeline: list) -> list:
        """
        Minimal aggregation: supports the specific pipeline used in
        dashboard_routes.py for service-health stats.
        """
        data = self._read()
        # Flatten task_states across all docs
        task_counts: dict = {}
        for doc in data:
            for task_id, state in doc.get("task_states", {}).items():
                if task_id not in task_counts:
                    task_counts[task_id] = {"total": 0, "success": 0, "failed": 0}
                task_counts[task_id]["total"] += 1
                if state == "COMPLETED":
                    task_counts[task_id]["success"] += 1
                elif state == "FAILED":
                    task_counts[task_id]["failed"] += 1
        return [
            {"_id": k, **v} for k, v in task_counts.items()
        ]

    @staticmethod
    def _match(doc: dict, query: dict) -> bool:
        for k, v in query.items():
            if doc.get(k) != v:
                return False
        return True


class _Cursor:
    def __init__(self, data: list):
        self._data = data
        self._sort_key = None
        self._sort_dir = 1
        self._limit_n  = None

    def sort(self, key: str, direction: int = -1):
        self._sort_key = key
        self._sort_dir = direction
        return self

    def limit(self, n: int):
        self._limit_n = n
        return self

    def __iter__(self):
        data = list(self._data)
        if self._sort_key:
            data.sort(
                key=lambda d: d.get(self._sort_key, ""),
                reverse=(self._sort_dir == -1),
            )
        if self._limit_n:
            data = data[: self._limit_n]
        return iter(data)


# ── Public API (mirrors pymongo interface used in routes) ──────────

_executions = _Collection(EXEC_FILE)
_logs        = _Collection(LOGS_FILE)
_alerts      = _Collection(ALERTS_FILE)


def get_executions_collection() -> _Collection:
    return _executions


def get_logs_collection() -> _Collection:
    return _logs


def get_alerts_collection() -> _Collection:
    return _alerts
