import { useState } from "react";
import API from "../api";
import { FaSearch, FaCheckCircle, FaSpinner, FaTimesCircle, FaClock } from "react-icons/fa";

const TASK_LABELS = {
  order_received: "Order Received",
  payment:        "Payment",
  inventory:      "Inventory Check",
  shipping:       "Shipping",
  notification:   "Notification",
  completed:      "Completed",
};

const StatusIcon = ({ status }) => {
  if (status === "COMPLETED") return <FaCheckCircle className="text-green-500 text-xl" />;
  if (status === "RUNNING")   return <FaSpinner className="text-blue-500 text-xl animate-spin" />;
  if (status === "FAILED")    return <FaTimesCircle className="text-red-500 text-xl" />;
  return <FaClock className="text-gray-300 text-xl" />;
};

const statusColor = (s) => {
  if (s === "COMPLETED") return "bg-green-100 text-green-700";
  if (s === "RUNNING")   return "bg-blue-100 text-blue-700";
  if (s === "FAILED")    return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-500";
};

const TrackOrder = () => {
  const [executionId, setExecutionId] = useState("");
  const [data, setData]               = useState(null);
  const [logs, setLogs]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!executionId.trim()) return;
    setError("");
    setLoading(true);
    try {
      const [execRes, logsRes] = await Promise.all([
        API.get(`/workflows/executions/${executionId.trim()}`),
        API.get(`/workflows/executions/${executionId.trim()}/logs`),
      ]);
      setData(execRes.data);
      setLogs(logsRes.data.logs || []);
    } catch (err) {
      setError("Execution not found. Check the ID and try again.");
      setData(null);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const taskStates = data?.task_states || {};
  const taskKeys   = Object.keys(TASK_LABELS);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
        <FaSearch className="text-blue-600" /> Track Your Order
      </h1>

      {/* Search */}
      <form onSubmit={handleTrack} className="flex gap-3 mb-8">
        <input
          value={executionId}
          onChange={(e) => setExecutionId(e.target.value)}
          placeholder="Enter Execution ID  e.g. EX-A1B2C3D4"
          className="flex-1 px-5 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-60"
        >
          {loading ? "Searching…" : "Track"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Summary card */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 font-medium">Execution ID</p>
                <p className="text-xl font-bold text-gray-800">{data.execution_id}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusColor(data.status)}`}>
                {data.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <p><span className="font-semibold text-gray-700">Order ID:</span> {data.order_id}</p>
              <p><span className="font-semibold text-gray-700">Customer:</span> {data.customer_name}</p>
              <p><span className="font-semibold text-gray-700">Amount:</span> ₹{data.amount?.toLocaleString()}</p>
              <p><span className="font-semibold text-gray-700">Started:</span> {data.created_at?.slice(0, 19).replace("T", " ")}</p>
            </div>
          </div>

          {/* Task progress */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-700 mb-5">Workflow Progress</h2>
            <div className="space-y-3">
              {taskKeys.map((key, idx) => {
                const state = taskStates[key] || "PENDING";
                return (
                  <div key={key} className="flex items-center gap-4">
                    <StatusIcon status={state} />
                    <div className="flex-1 flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <span className="font-semibold text-gray-700 text-sm">
                        {idx + 1}. {TASK_LABELS[key]}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(state)}`}>
                        {state}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logs */}
          {logs.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Execution Logs</h2>
              <div className="bg-gray-900 rounded-2xl p-4 font-mono text-xs text-green-400 space-y-2 max-h-64 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="border-b border-gray-800 pb-2 last:border-0">
                    <span className="text-gray-500">[{log.timestamp?.slice(0, 19).replace("T", " ")}]</span>{" "}
                    <span className="text-gray-200">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
