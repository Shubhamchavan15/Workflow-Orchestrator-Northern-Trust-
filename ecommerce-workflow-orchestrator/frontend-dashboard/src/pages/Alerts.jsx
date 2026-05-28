import { useEffect, useState } from "react";
import API from "../services/api";

const severityConfig = {
  Critical: { bg: "bg-red-500",    light: "bg-red-50 border-red-200",    text: "text-red-700",    icon: "🔴" },
  Warning:  { bg: "bg-yellow-500", light: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", icon: "🟡" },
};

const getFailureIcon = (title = "", message = "") => {
  const t = (title + message).toLowerCase();
  if (t.includes("payment") || t.includes("declined") || t.includes("card"))  return "💳";
  if (t.includes("inventory") || t.includes("stock"))                          return "📦";
  if (t.includes("shipping"))                                                   return "🚚";
  if (t.includes("notification"))                                               return "🔔";
  return "⚠️";
};

const Alerts = () => {
  const [alerts, setAlerts]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all"); // all | unresolved | resolved
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAlerts = () => {
    API.get("/workflows/alerts?limit=100")
      .then((r) => {
        setAlerts(r.data.alerts || []);
        setLastRefresh(new Date());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Initial fetch + auto-refresh every 10 seconds
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const resolve = async (execution_id) => {
    try {
      await API.patch(`/workflows/alerts/${execution_id}/resolve`);
      fetchAlerts();
    } catch (e) {}
  };

  const filtered = alerts.filter((a) => {
    if (filter === "unresolved") return !a.resolved;
    if (filter === "resolved")   return a.resolved;
    return true;
  });

  const unresolvedCount = alerts.filter((a) => !a.resolved).length;
  const criticalCount   = alerts.filter((a) => !a.resolved && a.severity === "Critical").length;
  const paymentFails    = alerts.filter((a) => (a.title + a.message).toLowerCase().includes("payment")).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Alerts</h1>
          <p className="text-gray-500 mt-1">
            Workflow failures and incidents · Auto-refreshes every 10s
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <p className="text-sm text-red-500 font-semibold">Unresolved</p>
          <p className="text-4xl font-bold text-red-600 mt-1">{unresolvedCount}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <p className="text-sm text-orange-500 font-semibold">Critical</p>
          <p className="text-4xl font-bold text-orange-600 mt-1">{criticalCount}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
          <p className="text-sm text-purple-500 font-semibold">Payment Failures</p>
          <p className="text-4xl font-bold text-purple-600 mt-1">{paymentFails}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["all", "unresolved", "resolved"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
              filter === f
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Last refresh */}
      <p className="text-xs text-gray-400 mb-4">
        Last refreshed: {lastRefresh.toLocaleTimeString()}
      </p>

      {/* Alert list */}
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">✅</p>
          <p className="text-xl font-semibold">No alerts found</p>
          <p className="text-sm mt-1">All workflows are healthy</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((alert, i) => {
            const cfg  = severityConfig[alert.severity] || severityConfig.Critical;
            const icon = getFailureIcon(alert.title, alert.message);
            return (
              <div
                key={i}
                className={`rounded-3xl border p-6 flex justify-between items-start gap-4 transition-all ${
                  alert.resolved ? "opacity-50 bg-gray-50 border-gray-200" : `${cfg.light}`
                }`}
              >
                {/* Left — icon + details */}
                <div className="flex gap-4 items-start">
                  <span className="text-3xl mt-1">{icon}</span>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{alert.title}</h2>
                    <p className="text-gray-600 text-sm mt-1">{alert.message}</p>

                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                      <span>🕐 {alert.created_at?.slice(0, 19).replace("T", " ")}</span>
                      <span>📋 Order: <span className="font-semibold text-gray-700">{alert.order_id}</span></span>
                      {alert.customer_name && (
                        <span>👤 {alert.customer_name}</span>
                      )}
                      {alert.amount > 0 && (
                        <span>
                          💰 {alert.currency || "INR"} {Number(alert.amount).toLocaleString()}
                        </span>
                      )}
                      <span>🔑 {alert.execution_id}</span>
                    </div>
                  </div>
                </div>

                {/* Right — severity + action */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-4 py-1.5 rounded-full text-white font-semibold text-xs ${cfg.bg}`}>
                    {cfg.icon} {alert.severity}
                  </span>
                  {!alert.resolved ? (
                    <button
                      onClick={() => resolve(alert.execution_id)}
                      className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-100 transition-all"
                    >
                      ✓ Resolve
                    </button>
                  ) : (
                    <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-xl text-xs font-semibold">
                      ✅ Resolved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Alerts;
