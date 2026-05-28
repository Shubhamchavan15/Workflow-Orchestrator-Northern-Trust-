"""
TaskExecutor — calls the real microservice HTTP endpoints.
Falls back to a simulated execution when no URL is configured.
"""
import os
import requests


# Service URL map — populated from environment variables set in docker-compose
SERVICE_URLS = {
    "payment-service":      os.getenv("PAYMENT_SERVICE_URL",      "http://localhost:8001/process"),
    "inventory-service":    os.getenv("INVENTORY_SERVICE_URL",    "http://localhost:8002/check"),
    "shipping-service":     os.getenv("SHIPPING_SERVICE_URL",     "http://localhost:8003/dispatch"),
    "notification-service": os.getenv("NOTIFICATION_SERVICE_URL", "http://localhost:8004/send"),
}

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678/webhook-test/order-notification")


class TaskExecutor:

    def execute(self, task: dict, order_data: dict = None) -> dict:
        """
        Execute a single workflow task.

        Parameters
        ----------
        task       : task definition from the workflow JSON
        order_data : the original order payload (passed through the whole chain)

        Returns
        -------
        dict with at least {"success": bool, ...service response fields}
        """
        task_id   = task["id"]
        task_type = task.get("type", "http")
        service   = task.get("service", "")

        print(f"[Executor] Running task: {task_id}")

        # ---- start / end nodes ----------------------------------------
        if task_type in ("start", "end"):
            print(f"[Executor] {task_type.upper()} node — no HTTP call needed")
            return {"success": True, "task_id": task_id}

        # ---- HTTP service tasks ----------------------------------------
        url = SERVICE_URLS.get(service)
        if not url:
            raise ValueError(f"No URL configured for service: {service}")

        payload = self._build_payload(task_id, order_data or {})

        try:
            resp = requests.post(url, json=payload, timeout=10)
            resp.raise_for_status()
            result = resp.json()
            print(f"[Executor] {task_id} → {result}")

            # Trigger n8n webhook after notification step
            if task_id == "notification":
                self._trigger_n8n(order_data or {}, result)

            return result

        except requests.exceptions.RequestException as exc:
            raise RuntimeError(f"HTTP call to {url} failed: {exc}") from exc

    # ------------------------------------------------------------------ #
    #  Payload builders                                                    #
    # ------------------------------------------------------------------ #

    def _build_payload(self, task_id: str, order: dict) -> dict:
        """Map task_id → correct request body for each microservice."""

        if task_id == "payment":
            return {
                "order_id":        order.get("order_id", "ORD-UNKNOWN"),
                "amount":          order.get("amount", 0),
                "currency":        order.get("currency", "INR"),
                "customer_id":     order.get("customer_id", "CUST-UNKNOWN"),
                "simulate_failure": order.get("simulate_payment_failure", False),
            }

        if task_id == "inventory":
            return {
                "order_id": order.get("order_id", "ORD-UNKNOWN"),
                "items":    order.get("items", [{"product_id": "PROD-001", "quantity": 1}]),
                "simulate_out_of_stock": order.get("simulate_out_of_stock", False),
            }

        if task_id == "shipping":
            return {
                "order_id":      order.get("order_id", "ORD-UNKNOWN"),
                "customer_name": order.get("customer_name", "Customer"),
                "address":       order.get("address", "123 Main St"),
                "city":          order.get("city", "Mumbai"),
                "pincode":       order.get("pincode", "400001"),
                "weight_kg":     order.get("weight_kg", 1.0),
            }

        if task_id == "notification":
            return {
                "order_id":          order.get("order_id", "ORD-UNKNOWN"),
                "customer_email":    order.get("customer_email", "customer@example.com"),
                "customer_name":     order.get("customer_name", "Customer"),
                "notification_type": "order_confirmed",
                "tracking_id":       order.get("tracking_id"),
                "message":           order.get("notification_message"),
            }

        # Generic fallback
        return {"order_id": order.get("order_id", "ORD-UNKNOWN")}

    # ------------------------------------------------------------------ #
    #  n8n webhook trigger                                                 #
    # ------------------------------------------------------------------ #

    def _trigger_n8n(self, order: dict, notification_result: dict):
        try:
            payload = {
                "order_id":       order.get("order_id"),
                "customer_email": order.get("customer_email"),
                "customer_name":  order.get("customer_name"),
                "status":         "order_confirmed",
                "notification":   notification_result,
            }
            requests.post(N8N_WEBHOOK_URL, json=payload, timeout=5)
            print(f"[Executor] n8n webhook triggered for order {order.get('order_id')}")
        except Exception as e:
            print(f"[Executor] n8n webhook failed (non-fatal): {e}")
