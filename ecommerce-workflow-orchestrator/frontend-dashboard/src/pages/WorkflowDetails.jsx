import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  IoArrowBackOutline, IoRefreshOutline,
} from "react-icons/io5";
import DAGVisualizer from "../components/DAGVisualizer";
import API from "../services/api";

const WorkflowDetails = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [data, setData]   = useState(null);
  const [logs, setLogs]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    if (!id) return;
    Promise.all([
      API.get(`/workflows/executions/${id}`),
      API.get(`/workflows/executions/${id}/logs`),
    ])
      .then(([execRes, logsRes]) => {
        setData(execRes.data);
        setLogs(logsRes.data.logs || []);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 3s while running
    const interval = setInterval(() => {
      if (data?.status === "RUNNING") fetchData();
    }, 3000);
    return () => clearInterval(interval);
  }, [id, data?.status]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p className="text-xl">Loading execution details…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p className="text-xl">Execution not found.</p>
        <button onClick={() => navigate("/executions")} className="mt-4 text-blue-600 hover:underline">
          ← Back to Executions
        </button>
      </div>
    );
  }

  // Pass task states as-is (uppercase) to DAGVisualizer
  const taskStatuses = data.task_states || {};

  const statusBadge = {
    COMPLETED: "bg-green-100 text-green-700",
    RUNNING:   "bg-blue-100 text-blue-700",
    FAILED:    "bg-red-100 text-red-700",
  }[data.status] || "bg-gray-100 text-gray-700";

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-950 min-h-full transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/executions")}
          className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl shadow-sm transition-all">
          <IoArrowBackOutline size={20} />
        </button>
        <div>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Execution Details</span>
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3">
            {id}
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${statusBadge}`}>{data.status}</span>
          </h1>
        </div>
        <button onClick={fetchData}
          className="ml-auto flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm font-semibold">
          <IoRefreshOutline size={16} /> Refresh
        </button>
      </div>

      {/* Info card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div><p className="text-gray-400 text-xs font-semibold uppercase mb-1">Order ID</p><p className="font-bold text-gray-800 dark:text-white">{data.order_id}</p></div>
          <div><p className="text-gray-400 text-xs font-semibold uppercase mb-1">Customer</p><p className="font-bold text-gray-800 dark:text-white">{data.customer_name || "—"}</p></div>
          <div><p className="text-gray-400 text-xs font-semibold uppercase mb-1">Amount</p><p className="font-bold text-gray-800 dark:text-white">₹{data.amount?.toLocaleString() || "—"}</p></div>
          <div><p className="text-gray-400 text-xs font-semibold uppercase mb-1">Started</p><p className="font-bold text-gray-800 dark:text-white">{data.created_at?.slice(0, 19).replace("T", " ")}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DAG */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Workflow Graph (DAG)</h2>
          <DAGVisualizer taskStatuses={taskStatuses} />
        </div>

        {/* Logs */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 flex flex-col h-[610px]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Execution Logs</h2>
          <div className="flex-1 bg-gray-900 rounded-2xl p-4 overflow-y-auto font-mono text-xs text-green-400 space-y-3">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="border-b border-gray-800 pb-2 last:border-0">
                  <span className="text-gray-500 font-semibold">[{log.timestamp?.slice(0, 19).replace("T", " ")}]</span>{" "}
                  <span className={log.message?.toLowerCase().includes("fail") ? "text-red-400" : "text-gray-200"}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetails;
