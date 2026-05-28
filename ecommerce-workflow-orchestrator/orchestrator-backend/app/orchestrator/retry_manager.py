import time


class RetryManager:

    def __init__(self, retries=3, delay=2):
        self.retries = retries
        self.delay = delay

    def retry(self, func, *args, **kwargs):

        for attempt in range(1, self.retries + 1):

            try:
                return func(*args, **kwargs)

            except Exception as e:

                print(f"Retry {attempt} failed: {e}")

                if attempt == self.retries:
                    raise

                time.sleep(self.delay)