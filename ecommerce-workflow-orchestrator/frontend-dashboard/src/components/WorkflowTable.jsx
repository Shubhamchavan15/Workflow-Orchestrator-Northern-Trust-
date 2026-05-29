import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { HiOutlineRefresh } from "react-icons/hi";
import API from "../services/api";

const statusConfig = {
  RUNNING:   { dot: "bg-blue-500 animate-pulse", badge: "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" },
  COMPLETED: { dot: "bg-green-500",              badge: "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800" },
  FAILED:    { dot: "bg-red-500",                badge: "bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800" },
};

const WorkflowTable = () => {
  const [executions, setExecutions] = useState([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);

  const fetchData = () => {
    API.get("/workflows/executions?limit=20")
      .then(r => { setExecutions(r.data.executions || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = executions.filter(e =>
    e.execution_id?.toLowerCase().includes(search.toLowerCase()) ||
    e.order_id?.toLowerCase().includes(search.toLowerCase()) ||
    e.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const currentTask = (taskStates = {}) => {
    const running = Object.entries(taskStates).find(([, v]) => v === "RUNNING");
    if (running) return running[0].replace(/_/g, " ");
    const last = Object.entries(taskStates).filter(([, v]) => v === "COMPLETED").pop();
    return last ? last[0].replace(/_/g, " ") : "—";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Workflows</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{filtered.length} executions</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1.5 rounded-lg outline-none w-44 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all" />
          <button onClick={fetchData} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
            <HiOutlineRefresh className="text-base" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No executions yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Place an order from the User Portal</p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-100 dark:border-gray-700">
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Execution</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Current Task</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {filtered.map(ex => {
              const cfg = statusConfig[ex.status] || statusConfig.COMPLETED;
              return (
                <tr key={ex.execution_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                  <td className="px-6 py-3.5">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white font-mono">{ex.execution_id}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{ex.order_id}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{ex.customer_name || "—"}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">₹{ex.amount?.toLocaleString() || "—"}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {ex.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{currentTask(ex.task_states)}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link to={`/executions/${ex.execution_id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      View <FaArrowRight size={9} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WorkflowTable;
