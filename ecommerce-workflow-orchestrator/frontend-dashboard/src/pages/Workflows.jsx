import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const statusStyle = (s) => {
  if (s === "RUNNING")   return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300";
  if (s === "COMPLETED") return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
  if (s === "FAILED")    return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
  return "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400";
};

const Workflows = () => {
  const [executions, setExecutions] = useState([]);
  const [filter, setFilter]         = useState("All");
  const [search, setSearch]         = useState("");

  useEffect(() => {
    API.get("/workflows/executions?limit=50")
      .then(r => setExecutions(r.data.executions || []))
      .catch(() => {});
  }, []);

  const filtered = executions.filter(e => {
    const matchFilter = filter === "All" || e.status === filter.toUpperCase();
    const matchSearch = e.execution_id?.toLowerCase().includes(search.toLowerCase()) ||
                        e.order_id?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const currentTask = (taskStates = {}) => {
    const running = Object.entries(taskStates).find(([, v]) => v === "RUNNING");
    if (running) return running[0];
    const completed = Object.entries(taskStates).filter(([, v]) => v === "COMPLETED");
    return completed.length ? completed[completed.length - 1][0] : "—";
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-full transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Workflows</h1>
        <input type="text" placeholder="Search workflows..." value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-5 py-3 rounded-xl outline-none w-80 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
      </div>

      <div className="flex gap-3 mb-8">
        {["All", "Running", "Completed", "Failed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-xl font-semibold transition-all text-sm ${
              filter === f
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl dark:text-gray-300">No workflows found.</p>
          <p className="text-sm mt-2">Place an order from the User Portal to see executions here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {filtered.map(ex => (
            <div key={ex.execution_id}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{ex.execution_id}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Order: {ex.order_id}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusStyle(ex.status)}`}>{ex.status}</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p><span className="font-semibold text-gray-800 dark:text-gray-100">Customer:</span> {ex.customer_name || "—"}</p>
                <p><span className="font-semibold text-gray-800 dark:text-gray-100">Amount:</span> ₹{ex.amount?.toLocaleString() || "—"}</p>
                <p><span className="font-semibold text-gray-800 dark:text-gray-100">Current Task:</span> {currentTask(ex.task_states)}</p>
                <p><span className="font-semibold text-gray-800 dark:text-gray-100">Started:</span> {ex.created_at?.slice(0, 19).replace("T", " ")}</p>
              </div>
              <Link to={`/executions/${ex.execution_id}`}
                className="mt-5 inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all text-sm font-semibold">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workflows;
