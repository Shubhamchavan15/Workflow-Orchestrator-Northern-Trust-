import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import {
  FaShoppingBag, FaUser, FaEnvelope, FaMapMarkerAlt,
  FaCheckCircle, FaExclamationCircle, FaTimesCircle,
  FaSpinner, FaBell,
} from "react-icons/fa";

const PRODUCTS = [
  { id: "PROD-001", name: "Wireless Headphones", price: 2499 },
  { id: "PROD-002", name: "Mechanical Keyboard",  price: 3999 },
  { id: "PROD-003", name: "USB-C Hub",             price: 1299 },
];

const PlaceOrder = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name:  "",
    customer_email: "",
    customer_id:    "CUST-" + Math.floor(Math.random() * 9000 + 1000),
    address:        "",
    city:           "",
    pincode:        "",
    currency:       "INR",
    simulate_payment_failure: false,
    simulate_out_of_stock:    false,
  });

  const [cart, setCart]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [submitted, setSubmitted]   = useState(null);   // { execution_id, order_id }
  const [execStatus, setExecStatus] = useState(null);   // full execution record
  const [polling, setPolling]       = useState(false);
  const [error, setError]           = useState("");
  const pollRef                     = useRef(null);

  const total = cart.reduce((sum, item) => {
    const prod = PRODUCTS.find((p) => p.id === item.product_id);
    return sum + (prod?.price || 0) * item.quantity;
  }, 0);

  // Poll execution status every 3s until terminal state
  useEffect(() => {
    if (!submitted) return;
    setPolling(true);

    const poll = async () => {
      try {
        const res = await API.get(`/workflows/executions/${submitted.execution_id}`);
        const data = res.data;
        setExecStatus(data);
        if (data.status === "COMPLETED" || data.status === "FAILED") {
          clearInterval(pollRef.current);
          setPolling(false);
        }
      } catch {
        // backend still starting the execution, keep polling
      }
    };

    poll(); // immediate first call
    pollRef.current = setInterval(poll, 3000);
    return () => clearInterval(pollRef.current);
  }, [submitted]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing)
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      return [...prev, { product_id: product.id, quantity: 1 }];
    });
  };

  const removeFromCart = (product_id) =>
    setCart((prev) => prev.filter((i) => i.product_id !== product_id));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (cart.length === 0) { setError("Add at least one item to your cart."); return; }
    if (!form.customer_name || !form.customer_email || !form.address || !form.city || !form.pincode) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const orderId = "ORD-" + Math.floor(Math.random() * 90000 + 10000);
      const payload = {
        ...form,
        order_id:  orderId,
        amount:    total,
        items:     cart,
        weight_kg: cart.reduce((s, i) => s + i.quantity * 0.5, 0),
      };
      const res = await API.post("/workflows/trigger", payload);
      setSubmitted({ execution_id: res.data.execution_id, order_id: orderId });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to place order. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // ── Result screen ────────────────────────────────────────────────
  if (submitted) {
    const isFailed    = execStatus?.status === "FAILED";
    const isCompleted = execStatus?.status === "COMPLETED";
    const isRunning   = !execStatus || execStatus.status === "RUNNING";

    const failedTask = isFailed
      ? Object.entries(execStatus?.task_states || {}).find(([, v]) => v === "FAILED")?.[0]
      : null;

    const isPaymentFail = failedTask === "payment";

    return (
      <div className="max-w-lg mx-auto mt-12 p-8 bg-white rounded-3xl shadow-xl text-center">

        {/* Icon */}
        {isRunning   && <FaSpinner    className="text-blue-500 text-6xl mx-auto mb-4 animate-spin" />}
        {isCompleted && <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />}
        {isFailed    && <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />}

        {/* Title */}
        {isRunning   && <h2 className="text-2xl font-bold text-gray-800 mb-1">Processing your order…</h2>}
        {isCompleted && <h2 className="text-2xl font-bold text-gray-800 mb-1">Order Confirmed!</h2>}
        {isFailed    && <h2 className="text-2xl font-bold text-red-700 mb-1">
          {isPaymentFail ? "Payment Failed" : "Order Failed"}
        </h2>}

        {/* Subtitle */}
        {isRunning && (
          <p className="text-gray-500 text-sm mb-6">
            Verifying payment, checking inventory and arranging shipping…
          </p>
        )}
        {isCompleted && (
          <p className="text-green-600 text-sm mb-4">
            Payment successful. Your order is confirmed and will be shipped soon.
          </p>
        )}
        {isFailed && isPaymentFail && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-5 text-left">
            <p className="text-red-700 font-semibold text-sm flex items-center gap-2 mb-1">
              <FaTimesCircle /> Payment could not be processed
            </p>
            <p className="text-red-600 text-xs">
              {Object.entries(execStatus?.task_states || {})
                .filter(([, v]) => v === "FAILED")
                .map(([k]) => k)
                .join(", ")} step failed. Please check your payment details and try again.
            </p>
            <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
              <FaBell className="text-orange-400" />
              A notification has been sent to <strong>{form.customer_email}</strong>
            </p>
          </div>
        )}
        {isFailed && !isPaymentFail && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 mb-5 text-left">
            <p className="text-orange-700 font-semibold text-sm mb-1">
              Order could not be completed
            </p>
            <p className="text-orange-600 text-xs">
              Failed at: <strong>{failedTask || "unknown"}</strong> step.
            </p>
            <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
              <FaBell className="text-orange-400" />
              A notification has been sent to <strong>{form.customer_email}</strong>
            </p>
          </div>
        )}

        {/* Order details */}
        <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 mb-6 text-sm">
          <p><span className="font-semibold text-gray-700">Order ID:</span> {submitted.order_id}</p>
          <p><span className="font-semibold text-gray-700">Execution ID:</span> {submitted.execution_id}</p>
          <p>
            <span className="font-semibold text-gray-700">Status:</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
              isCompleted ? "bg-green-100 text-green-700" :
              isFailed    ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
            }`}>
              {execStatus?.status || "RUNNING"}
            </span>
          </p>
          {/* Task states */}
          {execStatus?.task_states && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
              {Object.entries(execStatus.task_states).map(([task, state]) => (
                <div key={task} className="flex justify-between text-xs">
                  <span className="text-gray-600 capitalize">{task}</span>
                  <span className={`font-semibold ${
                    state === "COMPLETED" ? "text-green-600" :
                    state === "FAILED"    ? "text-red-600"   :
                    state === "RUNNING"   ? "text-blue-600"  : "text-gray-400"
                  }`}>{state}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {isCompleted && (
            <button
              onClick={() => navigate("/track")}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              Track Order
            </button>
          )}
          <button
            onClick={() => { setSubmitted(null); setExecStatus(null); setCart([]); }}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            {isFailed ? "Try Again" : "New Order"}
          </button>
        </div>
      </div>
    );
  }

  // ── Order form ───────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
        <FaShoppingBag className="text-blue-600" /> Place an Order
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — Products + Cart */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Products</h2>
            <div className="space-y-3">
              {PRODUCTS.map((p) => {
                const inCart = cart.find((i) => i.product_id === p.id);
                return (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="font-semibold text-gray-800">{p.name}</p>
                      <p className="text-blue-600 font-bold text-sm">₹{p.price.toLocaleString()}</p>
                    </div>
                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                          x{inCart.quantity}
                        </span>
                        <button onClick={() => removeFromCart(p.id)} className="text-red-500 text-xs hover:underline">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Cart Summary</h2>
              {cart.map((item) => {
                const prod = PRODUCTS.find((p) => p.id === item.product_id);
                return (
                  <div key={item.product_id} className="flex justify-between text-sm text-gray-600 py-2 border-b last:border-0">
                    <span>{prod?.name} × {item.quantity}</span>
                    <span className="font-semibold">₹{((prod?.price || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
              <div className="flex justify-between font-bold text-gray-800 mt-3 pt-3 border-t">
                <span>Total</span>
                <span className="text-blue-600">₹{total.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Demo flags */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-700 font-semibold text-sm mb-3">Demo Simulation Flags</p>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 cursor-pointer">
              <input
                type="checkbox"
                name="simulate_payment_failure"
                checked={form.simulate_payment_failure}
                onChange={handleChange}
                className="w-4 h-4"
              />
              Force Payment Failure
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="simulate_out_of_stock"
                checked={form.simulate_out_of_stock}
                onChange={handleChange}
                className="w-4 h-4"
              />
              Simulate Out of Stock
            </label>
          </div>
        </div>

        {/* RIGHT — Customer Details */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-6">Customer Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name *</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  name="customer_name" value={form.customer_name} onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Email *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  name="customer_email" value={form.customer_email} onChange={handleChange}
                  type="email" placeholder="john@example.com"
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Address *</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  name="address" value={form.address} onChange={handleChange}
                  placeholder="123 Main Street"
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">City *</label>
                <input
                  name="city" value={form.city} onChange={handleChange}
                  placeholder="Mumbai"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Pincode *</label>
                <input
                  name="pincode" value={form.pincode} onChange={handleChange}
                  placeholder="400001" maxLength={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                <FaExclamationCircle /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200 mt-2"
            >
              {loading ? "Placing Order…" : `Place Order — ₹${total.toLocaleString()}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
