import { useEffect, useState } from "react";
import API from "../services/api";

const Alerts = () => {
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = () => {
    API.get("/workflows/alerts")
      .then((r) => setAlerts(r.data.alerts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, []);

  const resolve = async (execution_id) => {
    try {
      await API.patch(`/workflows/alerts/${execution_id}/resolve`);
      fetchAlerts();
    } catch (e) {}
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Alerts</h1>
        <p className="text-gray-500 mt-2">Workflow failures and incidents</p>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl">No alerts. All workflows are healthy.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`bg-white rounded-3xl shadow-lg p-6 flex justify-between items-center ${
                alert.resolved ? "opacity-50" : ""
              }`}
            >
              <div>
                <h2 className="text-xl font-bold text-gray-800">{alert.title}</h2>
                <p className="text-gray-500 text-sm mt-1">{alert.message}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {alert.created_at?.slice(0, 19).replace("T", " ")} · Order: {alert.order_id}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-5 py-2 rounded-full text-white font-semibold text-sm ${
                    alert.severity === "Critical" ? "bg-red-500" : "bg-yellow-500"
                  }`}
                >
                  {alert.severity}
                </span>
                {!alert.resolved && (
                  <button
                    onClick={() => resolve(alert.execution_id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
                  >
                    Resolve
                  </button>
                )}
                {alert.resolved && (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-semibold">
                    Resolved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
