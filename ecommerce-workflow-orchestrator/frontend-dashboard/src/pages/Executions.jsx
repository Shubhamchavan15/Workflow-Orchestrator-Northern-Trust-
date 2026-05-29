import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineRefresh } from "react-icons/hi";
import { FaArrowRight } from "react-icons/fa";
import API from "../services/api";

const TASK_ORDER = ["order_received", "inventory", "payment", "shipping", "notification", "completed"];

const TASK_ICONS = {
  order_received: "🛒",
  inventory:      "📦",
  payment:        "💳",
  shipping:       "🚚",
  notification:   "🔔",
  completed:      "✅",
};

const taskPill = (s) => {
  if (s === "COMPLETED") return "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800";
  if (s === "RUNNING")   return "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 animate-pulse";
  if (s === "FAILED")    return "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800";
  return "bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700";
};

const statusBadge = (s) => {
  if (s === "COMPLETED") return "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800";
  if (s === "RUNNING")   return "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
  if (s === "FAILED")    return "bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800";
  return "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400";
};

const Executions = () => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading]       = useState(true);

  const fetchData = () => {
    setLoading(true);
    API.get("/workflows/executions?limit=20")
      .then(r => { setExecutions(r.data.executions || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-full transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Executions</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Live workflow execution progress</p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl hover:border-blue-300 transition-all">
          <HiOutlineRefresh className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-36 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-700" />)}
        </div>
      ) : executions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 text-3xl">📋</div>
          <p className="text-base font-semibold text-gray-500 dark:text-gray-400">No executions yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Place an order from the User Portal to see executions here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {executions.map(ex => {
            const taskStates = ex.task_states || {};
            return (
              <div key={ex.execution_id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all duration-200 group">

                {/* Top row */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">{ex.execution_id}</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge(ex.status)}`}>{ex.status}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                      <span>📋 {ex.order_id}</span>
                      <span>👤 {ex.customer_name || "—"}</span>
                      <span>💰 ₹{ex.amount?.toLocaleString() || "—"}</span>
                      <span>🕐 {ex.created_at?.slice(0, 19).replace("T", " ")}</span>
                    </div>
                  </div>
                  <Link to={`/executions/${ex.execution_id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    Details <FaArrowRight size={9} />
                  </Link>
                </div>

                {/* Task pipeline */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {TASK_ORDER.map((taskId, idx) => {
                    const state = taskStates[taskId] || "PENDING";
                    return (
                      <div key={taskId} className="flex items-center gap-1.5">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${taskPill(state)}`}>
                          <span>{TASK_ICONS[taskId]}</span>
                          <span className="capitalize">{taskId.replace(/_/g, " ")}</span>
                        </div>
                        {idx < TASK_ORDER.length - 1 && (
                          <span className="text-gray-200 dark:text-gray-700 text-sm">›</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Executions;
