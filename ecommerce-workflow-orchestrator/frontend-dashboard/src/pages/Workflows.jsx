import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const statusStyle = (s) => {
  if (s === "RUNNING")   return "bg-blue-500";
  if (s === "COMPLETED") return "bg-green-500";
  if (s === "FAILED")    return "bg-red-500";
  return "bg-gray-400";
};

const Workflows = () => {
  const [executions, setExecutions] = useState([]);
  const [filter, setFilter]         = useState("All");
  const [search, setSearch]         = useState("");

  useEffect(() => {
    API.get("/workflows/executions?limit=50")
      .then((r) => setExecutions(r.data.executions || []))
      .catch(() => {});
  }, []);

  const filtered = executions.filter((e) => {
    const matchFilter = filter === "All" || e.status === filter.toUpperCase();
    const matchSearch =
      e.execution_id?.toLowerCase().includes(search.toLowerCase()) ||
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Workflows</h1>
        <input
          type="text"
          placeholder="Search workflows..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 px-5 py-3 rounded-xl outline-none w-80 bg-white shadow-sm"
        />
      </div>

      <div className="flex gap-4 mb-8">
        {["All", "Running", "Completed", "Failed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-xl font-semibold transition-all ${
              filter === f ? "bg-blue-600 text-white" : "bg-white shadow-sm text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl">No workflows found.</p>
          <p className="text-sm mt-2">Place an order from the User Portal to see executions here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {filtered.map((ex) => (
            <div
              key={ex.execution_id}
              className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{ex.execution_id}</h2>
                  <p className="text-gray-500 text-sm mt-1">Order: {ex.order_id}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-white text-sm font-semibold ${statusStyle(ex.status)}`}>
                  {ex.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-semibold text-gray-800">Customer:</span> {ex.customer_name || "—"}</p>
                <p><span className="font-semibold text-gray-800">Amount:</span> ₹{ex.amount?.toLocaleString() || "—"}</p>
                <p><span className="font-semibold text-gray-800">Current Task:</span> {currentTask(ex.task_states)}</p>
                <p><span className="font-semibold text-gray-800">Started:</span> {ex.created_at?.slice(0, 19).replace("T", " ")}</p>
              </div>

              <Link
                to={`/executions/${ex.execution_id}`}
                className="mt-5 inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all text-sm font-semibold"
              >
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
