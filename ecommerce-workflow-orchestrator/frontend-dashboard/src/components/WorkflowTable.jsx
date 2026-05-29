import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const statusStyle = (s) => {
  if (s === "RUNNING")   return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300";
  if (s === "COMPLETED") return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
  if (s === "FAILED")    return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
  return "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400";
};

const WorkflowTable = () => {
  const [executions, setExecutions] = useState([]);
  const [search, setSearch]         = useState("");

  useEffect(() => {
    API.get("/workflows/executions?limit=20")
      .then(r => setExecutions(r.data.executions || []))
      .catch(() => {});
  }, []);

  const filtered = executions.filter(e =>
    e.execution_id?.toLowerCase().includes(search.toLowerCase()) ||
    e.order_id?.toLowerCase().includes(search.toLowerCase())
  );

  const currentTask = (taskStates = {}) => {
    const running = Object.entries(taskStates).find(([, v]) => v === "RUNNING");
    if (running) return running[0];
    const last = Object.entries(taskStates).filter(([, v]) => v === "COMPLETED").pop();
    return last ? last[0] : "—";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recent Workflows</h2>
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg outline-none focus:border-blue-400 transition-all text-sm" />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No executions yet. Place an order to get started.</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-sm">
              <th className="pb-4">Execution ID</th>
              <th className="pb-4">Order ID</th>
              <th className="pb-4">Customer</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Current Task</th>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ex => (
              <tr key={ex.execution_id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="py-4 font-semibold text-sm text-gray-800 dark:text-white">{ex.execution_id}</td>
                <td className="text-sm text-gray-600 dark:text-gray-300">{ex.order_id}</td>
                <td className="text-sm text-gray-600 dark:text-gray-300">{ex.customer_name || "—"}</td>
                <td>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(ex.status)}`}>
                    {ex.status}
                  </span>
                </td>
                <td className="text-sm capitalize text-gray-600 dark:text-gray-300">{currentTask(ex.task_states)}</td>
                <td>
                  <Link to={`/executions/${ex.execution_id}`}
                    className="text-blue-600 dark:text-blue-400 text-xs font-semibold hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WorkflowTable;
