"""
RetryManager — exponential-backoff retry with configurable attempts.
Business failures (success=False from a service) are never retried.
"""
import time
from app.orchestrator.executor import _BusinessFailure


class RetryManager:

    def __init__(self, retries: int = 3, delay: float = 2.0, backoff: float = 2.0):
        self.retries = retries
        self.delay   = delay
        self.backoff = backoff

    def retry(self, func, *args, **kwargs):
        """
        Call func(*args, **kwargs) up to self.retries times.
        _BusinessFailure is re-raised immediately without retrying.
        Raises the last exception if all attempts fail.
        """
        current_delay = self.delay

        for attempt in range(1, self.retries + 1):
            try:
                return func(*args, **kwargs)

            except _BusinessFailure:
                # Card declined, out of stock, etc. — no point retrying
                raise

            except Exception as exc:
                print(f"[RetryManager] Attempt {attempt}/{self.retries} failed: {exc}")

                if attempt == self.retries:
                    raise

                print(f"[RetryManager] Retrying in {current_delay}s …")
                time.sleep(current_delay)
                current_delay *= self.backoff
