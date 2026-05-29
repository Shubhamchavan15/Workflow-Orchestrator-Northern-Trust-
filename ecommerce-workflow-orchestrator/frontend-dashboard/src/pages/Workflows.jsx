import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaFilter } from "react-icons/fa";
import { HiOutlineRefresh } from "react-icons/hi";
import API from "../services/api";

const STATUS_CONFIG = {
  RUNNING:   { dot: "bg-blue-500 animate-pulse", badge: "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" },
  COMPLETED: { dot: "bg-green-500",              badge: "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800" },
  FAILED:    { dot: "bg-red-500",                badge: "bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800" },
};

const FILTERS = ["All", "Running", "Completed", "Failed"];

const Workflows = () => {
  const [executions, setExecutions] = useState([]);
  const [filter, setFilter]         = useState("All");
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);

  const fetchData = () => {
    setLoading(true);
    API.get("/workflows/executions?limit=50")
      .then(r => { setExecutions(r.data.executions || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = executions.filter(e => {
    const matchFilter = filter === "All" || e.status === filter.toUpperCase();
    const matchSearch = e.execution_id?.toLowerCase().includes(search.toLowerCase()) ||
                        e.order_id?.toLowerCase().includes(search.toLowerCase()) ||
                        e.customer_name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = FILTERS.slice(1).reduce((acc, f) => {
    acc[f] = executions.filter(e => e.status === f.toUpperCase()).length;
    return acc;
  }, {});

  const currentTask = (taskStates = {}) => {
    const running = Object.entries(taskStates).find(([, v]) => v === "RUNNING");
    if (running) return running[0].replace(/_/g, " ");
    const completed = Object.entries(taskStates).filter(([, v]) => v === "COMPLETED");
    return completed.length ? completed[completed.length - 1][0].replace(/_/g, " ") : "—";
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-full transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflows</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{filtered.length} of {executions.length} executions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input type="text" placeholder="Search by ID, order, customer…" value={search} onChange={e => setSearch(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white pl-4 pr-4 py-2 rounded-xl outline-none w-72 focus:border-blue-400 focus:ring-2 focus:ring-blue-100/50 transition-all" />
          </div>
          <button onClick={fetchData} className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <HiOutlineRefresh className={`text-base ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter tabs with counts */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter("All")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            filter === "All" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}>
          All
          <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${filter === "All" ? "bg-white/20 dark:bg-black/20" : "bg-gray-100 dark:bg-gray-700"}`}>
            {executions.length}
          </span>
        </button>
        {[
          { label: "Running",   color: "text-blue-600 dark:text-blue-400",   activeBg: "bg-blue-600" },
          { label: "Completed", color: "text-green-600 dark:text-green-400", activeBg: "bg-green-600" },
          { label: "Failed",    color: "text-red-600 dark:text-red-400",     activeBg: "bg-red-600" },
        ].map(({ label, color, activeBg }) => (
          <button key={label} onClick={() => setFilter(label)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === label ? `${activeBg} text-white shadow-sm` : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}>
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${filter === label ? "bg-white/20" : `bg-gray-100 dark:bg-gray-700 ${color}`}`}>
              {counts[label] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-700" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
            <FaFilter className="text-2xl text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-base font-semibold text-gray-500 dark:text-gray-400">No workflows found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {search ? "Try a different search term" : "Place an order from the User Portal to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ex => {
            const cfg = STATUS_CONFIG[ex.status] || STATUS_CONFIG.COMPLETED;
            return (
              <div key={ex.execution_id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Status dot */}
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />

                    {/* Main info */}
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">{ex.execution_id}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
                          {ex.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 dark:text-gray-500">
                        <span>📋 {ex.order_id}</span>
                        <span>👤 {ex.customer_name || "—"}</span>
                        <span>💰 ₹{ex.amount?.toLocaleString() || "—"}</span>
                        <span>⚙️ {currentTask(ex.task_states)}</span>
                        <span>🕐 {ex.created_at?.slice(0, 19).replace("T", " ")}</span>
                      </div>
                    </div>
                  </div>

                  <Link to={`/executions/${ex.execution_id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    View <FaArrowRight size={9} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Workflows;
