"""
RetryManager — exponential-backoff retry with configurable attempts.
"""
import time


class RetryManager:

    def __init__(self, retries: int = 3, delay: float = 2.0, backoff: float = 2.0):
        self.retries = retries
        self.delay   = delay
        self.backoff = backoff   # multiply delay by this factor each attempt

    def retry(self, func, *args, **kwargs):
        """
        Call func(*args, **kwargs) up to self.retries times.
        Raises the last exception if all attempts fail.
        """
        current_delay = self.delay

        for attempt in range(1, self.retries + 1):
            try:
                return func(*args, **kwargs)

            except Exception as exc:
                print(f"[RetryManager] Attempt {attempt}/{self.retries} failed: {exc}")

                if attempt == self.retries:
                    raise

                print(f"[RetryManager] Retrying in {current_delay}s …")
                time.sleep(current_delay)
                current_delay *= self.backoff
