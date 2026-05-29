import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import {
  FaShoppingCart, FaUser, FaEnvelope, FaMapMarkerAlt,
  FaCheckCircle, FaExclamationCircle, FaTimesCircle,
  FaSpinner, FaBell, FaPlus, FaMinus, FaTrash, FaTag,
} from "react-icons/fa";

const CATEGORIES = ["All", "Electronics", "Audio", "Accessories", "Gaming", "Office"];

const PRODUCTS = [
  { id: "PROD-001", name: "Wireless Headphones",    price: 2499, category: "Audio",       rating: 4.5, reviews: 128, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop", badge: "Bestseller" },
  { id: "PROD-002", name: "Mechanical Keyboard",    price: 3999, category: "Electronics", rating: 4.7, reviews: 95,  image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop", badge: "Top Rated" },
  { id: "PROD-003", name: "USB-C Hub 7-in-1",       price: 1299, category: "Accessories", rating: 4.3, reviews: 210, image: "https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=300&h=300&fit=crop", badge: null },
  { id: "PROD-004", name: "Gaming Mouse",           price: 1899, category: "Gaming",      rating: 4.6, reviews: 176, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop", badge: "New" },
  { id: "PROD-005", name: "4K Webcam",              price: 4599, category: "Electronics", rating: 4.4, reviews: 63,  image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=300&h=300&fit=crop", badge: null },
  { id: "PROD-006", name: "Noise Cancelling Earbuds", price: 3299, category: "Audio",    rating: 4.8, reviews: 302, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop", badge: "Hot" },
  { id: "PROD-007", name: "Laptop Stand",           price: 899,  category: "Office",      rating: 4.2, reviews: 88,  image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&h=300&fit=crop", badge: null },
  { id: "PROD-008", name: "Wireless Charger Pad",   price: 799,  category: "Accessories", rating: 4.1, reviews: 145, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=300&fit=crop", badge: null },
  { id: "PROD-009", name: "Gaming Headset",         price: 2999, category: "Gaming",      rating: 4.5, reviews: 221, image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=300&h=300&fit=crop", badge: "Popular" },
  { id: "PROD-010", name: "Ergonomic Mouse Pad",    price: 599,  category: "Office",      rating: 4.0, reviews: 67,  image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop", badge: null },
  { id: "PROD-011", name: "Portable SSD 1TB",       price: 5999, category: "Electronics", rating: 4.9, reviews: 189, image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop", badge: "Top Rated" },
  { id: "PROD-012", name: "Smart LED Desk Lamp",    price: 1499, category: "Office",      rating: 4.3, reviews: 112, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop", badge: "New" },
];

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`text-xs ${s <= Math.floor(rating) ? "text-yellow-400" : s - 0.5 <= rating ? "text-yellow-300" : "text-gray-200"}`}>★</span>
      ))}
    </div>
  );
};

const BADGE_COLORS = {
  "Bestseller": "bg-blue-500",
  "Top Rated":  "bg-purple-500",
  "New":        "bg-green-500",
  "Hot":        "bg-red-500",
  "Popular":    "bg-orange-500",
};

const PlaceOrder = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [form, setForm] = useState({
    customer_name: "", customer_email: "",
    customer_id: "CUST-" + Math.floor(Math.random() * 9000 + 1000),
    address: "", city: "", pincode: "", currency: "INR",
    simulate_payment_failure: false, simulate_out_of_stock: false,
  });
  const [cart, setCart]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [submitted, setSubmitted]   = useState(null);
  const [execStatus, setExecStatus] = useState(null);
  const [polling, setPolling]       = useState(false);
  const [error, setError]           = useState("");
  const [step, setStep]             = useState(1); // 1=shop, 2=checkout
  const pollRef                     = useRef(null);

  const filteredProducts = activeCategory === "All"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  const total = cart.reduce((sum, item) => {
    const prod = PRODUCTS.find(p => p.id === item.product_id);
    return sum + (prod?.price || 0) * item.quantity;
  }, 0);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (!submitted) return;
    setPolling(true);
    const poll = async () => {
      try {
        const res = await API.get(`/workflows/executions/${submitted.execution_id}`);
        setExecStatus(res.data);
        if (res.data.status === "COMPLETED" || res.data.status === "FAILED") {
          clearInterval(pollRef.current); setPolling(false);
        }
      } catch {}
    };
    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => clearInterval(pollRef.current);
  }, [submitted]);

  const updateCart = (product, delta) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (!existing && delta > 0) return [...prev, { product_id: product.id, quantity: 1 }];
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(i => i.product_id !== product.id);
        return prev.map(i => i.product_id === product.id ? { ...i, quantity: newQty } : i);
      }
      return prev;
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!form.customer_name || !form.customer_email || !form.address || !form.city || !form.pincode) {
      setError("Please fill in all required fields."); return;
    }
    setLoading(true);
    try {
      const orderId = "ORD-" + Math.floor(Math.random() * 90000 + 10000);
      const res = await API.post("/workflows/trigger", {
        ...form, order_id: orderId, amount: total, items: cart,
        weight_kg: cart.reduce((s, i) => s + i.quantity * 0.5, 0),
      });
      setSubmitted({ execution_id: res.data.execution_id, order_id: orderId });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to place order. Is the backend running?");
    } finally { setLoading(false); }
  };

  // ── Result screen ────────────────────────────────────────────────
  if (submitted) {
    const isFailed    = execStatus?.status === "FAILED";
    const isCompleted = execStatus?.status === "COMPLETED";
    const isRunning   = !execStatus || execStatus.status === "RUNNING";
    const failedTask  = isFailed ? Object.entries(execStatus?.task_states || {}).find(([,v]) => v === "FAILED")?.[0] : null;
    const isPaymentFail = failedTask === "payment";

    return (
      <div className="max-w-lg mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl text-center transition-colors duration-300">
        {isRunning   && <FaSpinner     className="text-blue-500 text-6xl mx-auto mb-4 animate-spin" />}
        {isCompleted && <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />}
        {isFailed    && <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />}

        {isRunning   && <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Processing your order…</h2>}
        {isCompleted && <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Order Confirmed! 🎉</h2>}
        {isFailed    && <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-1">{isPaymentFail ? "Payment Failed" : "Order Failed"}</h2>}

        {isRunning   && <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Checking inventory, processing payment…</p>}
        {isCompleted && <p className="text-green-600 dark:text-green-400 text-sm mb-4">Payment successful. Your order is confirmed and will be shipped soon.</p>}

        {isFailed && isPaymentFail && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-4 mb-5 text-left">
            <p className="text-red-700 dark:text-red-300 font-semibold text-sm flex items-center gap-2 mb-1"><FaTimesCircle /> Payment could not be processed</p>
            <p className="text-red-600 dark:text-red-400 text-xs">Please check your payment details and try again.</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 flex items-center gap-1">
              <FaBell className="text-orange-400" /> A notification has been sent to <strong>{form.customer_email}</strong>
            </p>
          </div>
        )}
        {isFailed && !isPaymentFail && (
          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-2xl px-5 py-4 mb-5 text-left">
            <p className="text-orange-700 dark:text-orange-300 font-semibold text-sm mb-1">Order could not be completed</p>
            <p className="text-orange-600 dark:text-orange-400 text-xs">Failed at: <strong>{failedTask || "unknown"}</strong> step.</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 flex items-center gap-1">
              <FaBell className="text-orange-400" /> A notification has been sent to <strong>{form.customer_email}</strong>
            </p>
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 text-left space-y-2 mb-6 text-sm">
          <p><span className="font-semibold text-gray-700 dark:text-gray-200">Order ID:</span> <span className="text-gray-600 dark:text-gray-300">{submitted.order_id}</span></p>
          <p><span className="font-semibold text-gray-700 dark:text-gray-200">Execution ID:</span> <span className="text-gray-600 dark:text-gray-300">{submitted.execution_id}</span></p>
          <p>
            <span className="font-semibold text-gray-700 dark:text-gray-200">Status:</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
              isCompleted ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" :
              isFailed    ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" :
                            "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            }`}>
              {execStatus?.status || "RUNNING"}
            </span>
          </p>
          {execStatus?.task_states && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-1">
              {Object.entries(execStatus.task_states).map(([task, state]) => (
                <div key={task} className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-300 capitalize">{task}</span>
                  <span className={`font-semibold ${
                    state === "COMPLETED" ? "text-green-600 dark:text-green-400" :
                    state === "FAILED"    ? "text-red-600 dark:text-red-400"     :
                    state === "RUNNING"   ? "text-blue-600 dark:text-blue-400"   : "text-gray-400"
                  }`}>{state}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          {isCompleted && (
            <button onClick={() => navigate("/track")}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all">
              Track Order
            </button>
          )}
          <button onClick={() => { setSubmitted(null); setExecStatus(null); setCart([]); setStep(1); }}
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
            {isFailed ? "Try Again" : "New Order"}
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: Checkout ─────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-blue-600 font-semibold mb-6 hover:underline text-sm">
          ← Back to Shop
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order summary */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Order Summary</h2>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 space-y-3">
              {cart.map(item => {
                const prod = PRODUCTS.find(p => p.id === item.product_id);
                return (
                  <div key={item.product_id} className="flex items-center gap-4">
                    <img src={prod?.image} alt={prod?.name} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">{prod?.name}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-blue-600">₹{((prod?.price||0)*item.quantity).toLocaleString()}</p>
                  </div>
                );
              })}
              <div className="border-t dark:border-gray-700 pt-3 flex justify-between font-bold text-gray-800 dark:text-white">
                <span>Total</span>
                <span className="text-blue-600 text-lg">₹{total.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <p className="text-amber-700 dark:text-amber-300 font-semibold text-sm mb-3">Demo Flags</p>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2 cursor-pointer">
                <input type="checkbox" name="simulate_payment_failure" checked={form.simulate_payment_failure} onChange={handleChange} className="w-4 h-4" />
                Force Payment Failure
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" name="simulate_out_of_stock" checked={form.simulate_out_of_stock} onChange={handleChange} className="w-4 h-4" />
                Simulate Out of Stock
              </label>
            </div>
          </div>
          {/* Customer form */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Delivery Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Full Name *</label>
                <div className="relative"><FaUser className="absolute left-3 top-3.5 text-gray-400" />
                  <input name="customer_name" value={form.customer_name} onChange={handleChange} placeholder="John Doe"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Email *</label>
                <div className="relative"><FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                  <input name="customer_email" value={form.customer_email} onChange={handleChange} type="email" placeholder="john@example.com"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Address *</label>
                <div className="relative"><FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400" />
                  <input name="address" value={form.address} onChange={handleChange} placeholder="123 Main Street"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">City *</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Pincode *</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="400001" maxLength={6}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
              </div>
              {error && <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl px-4 py-3 text-sm"><FaExclamationCircle /> {error}</div>}
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all disabled:opacity-60 shadow-lg shadow-blue-200 mt-2">
                {loading ? "Placing Order…" : `Place Order — ₹${total.toLocaleString()}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 1: Shop ─────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 mb-10 text-white flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">ShopFlow Store</h1>
          <p className="text-blue-100 text-lg">Premium tech products, delivered fast</p>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">🚚 Free Shipping</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">🔒 Secure Payment</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">↩️ Easy Returns</span>
          </div>
        </div>
        <div className="text-8xl hidden md:block">🛍️</div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:text-blue-600"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
        {filteredProducts.map(product => {
          const inCart = cart.find(i => i.product_id === product.id);
          return (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { e.target.src = `https://picsum.photos/seed/${product.id}/300/300`; }} />
                {product.badge && (
                  <span className={`absolute top-2 left-2 ${BADGE_COLORS[product.badge] || "bg-gray-500"} text-white text-xs font-bold px-2 py-1 rounded-lg`}>
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-blue-500 font-semibold mb-1 flex items-center gap-1"><FaTag size={10} /> {product.category}</p>
                <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-1 leading-tight">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <StarRating rating={product.rating} />
                  <span className="text-xs text-gray-400">({product.reviews})</span>
                </div>
                <p className="text-blue-600 font-bold text-lg mb-3">₹{product.price.toLocaleString()}</p>
                {!inCart ? (
                  <button onClick={() => updateCart(product, 1)}
                    className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    <FaPlus size={10} /> Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900 rounded-xl px-3 py-1.5">
                    <button onClick={() => updateCart(product, -1)} className="text-blue-600 dark:text-blue-300 hover:text-blue-800 p-1"><FaMinus size={10} /></button>
                    <span className="font-bold text-blue-700 dark:text-blue-200 text-sm">{inCart.quantity}</span>
                    <button onClick={() => updateCart(product, 1)} className="text-blue-600 dark:text-blue-300 hover:text-blue-800 p-1"><FaPlus size={10} /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button onClick={() => setStep(2)}
            className="flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-blue-400 font-bold text-base transition-all">
            <div className="relative">
              <FaShoppingCart className="text-xl" />
              <span className="absolute -top-2 -right-2 bg-white text-blue-600 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
            </div>
            <span>{cartCount} item{cartCount > 1 ? "s" : ""} in cart</span>
            <span className="bg-white/20 px-3 py-1 rounded-xl">₹{total.toLocaleString()}</span>
            <span>→ Checkout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
