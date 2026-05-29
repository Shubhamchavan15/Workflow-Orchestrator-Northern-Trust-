import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBell, FaUserCircle, FaCheckCircle, FaMoon, FaSun } from "react-icons/fa";
import { HiOutlineRefresh } from "react-icons/hi";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

const PAGE_TITLES = {
  "/":            { title: "Overview",   sub: "Workflow performance at a glance" },
  "/workflows":   { title: "Workflows",  sub: "All workflow executions" },
  "/executions":  { title: "Executions", sub: "Live execution progress" },
  "/tasks":       { title: "Tasks",      sub: "Microservice health" },
  "/logs":        { title: "Logs",       sub: "Real-time orchestration logs" },
  "/alerts":      { title: "Alerts",     sub: "Failures and incidents" },
  "/settings":    { title: "Settings",   sub: "Configure the orchestrator" },
};

const Navbar = () => {
  const [alerts, setAlerts]   = useState([]);
  const [open, setOpen]       = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef           = useRef(null);
  const navigate              = useNavigate();
  const location              = useLocation();
  const { dark, toggle }      = useTheme();

  const page = PAGE_TITLES[location.pathname] || { title: "Dashboard", sub: "" };

  const fetchAlerts = () => {
    API.get("/workflows/alerts?limit=20")
      .then(r => setAlerts(r.data.alerts || []))
      .catch(() => {});
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
    window.location.reload();
  };

  useEffect(() => {
    fetchAlerts();
    const id = setInterval(fetchAlerts, 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unresolved = alerts.filter(a => !a.resolved);

  const resolve = async (execution_id, e) => {
    e.stopPropagation();
    try { await API.patch(`/workflows/alerts/${execution_id}/resolve`); fetchAlerts(); } catch {}
  };

  const getIcon = (title = "", message = "") => {
    const t = (title + message).toLowerCase();
    if (t.includes("payment") || t.includes("declined")) return "💳";
    if (t.includes("inventory") || t.includes("stock"))  return "📦";
    if (t.includes("shipping"))                           return "🚚";
    return "⚠️";
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 py-4 relative z-50 transition-colors duration-300">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{page.title}</h1>
        {page.sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{page.sub}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">

        {/* Refresh */}
        <button onClick={handleRefresh}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          aria-label="Refresh">
          <HiOutlineRefresh className={`text-lg ${refreshing ? "animate-spin" : ""}`} />
        </button>

        {/* Dark mode */}
        <button onClick={toggle}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode">
          {dark
            ? <FaSun  className="text-yellow-400 text-base" />
            : <FaMoon className="text-gray-400 text-base" />}
        </button>

        {/* Bell */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setOpen(v => !v)}
            className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
            aria-label="Notifications">
            <FaBell className={`text-base transition-colors ${unresolved.length > 0 ? "text-red-500" : "text-gray-400"}`} />
            {unresolved.length > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow">
                {unresolved.length > 9 ? "9+" : unresolved.length}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
                <span className="font-semibold text-gray-800 dark:text-white text-sm">Notifications</span>
                {unresolved.length > 0 && (
                  <span className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">
                    {unresolved.length} new
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                {alerts.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">
                    <FaCheckCircle className="text-3xl mx-auto mb-2 text-green-400" />
                    <p className="text-sm">All clear — no alerts</p>
                  </div>
                ) : (
                  alerts.slice(0, 10).map((alert, i) => (
                    <div key={i} className={`px-5 py-3.5 flex gap-3 items-start hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${alert.resolved ? "opacity-40" : ""}`}>
                      <span className="text-lg mt-0.5 shrink-0">{getIcon(alert.title, alert.message)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{alert.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{alert.created_at?.slice(0, 19).replace("T", " ")}</p>
                      </div>
                      <div className="shrink-0">
                        {!alert.resolved
                          ? <button onClick={e => resolve(alert.execution_id, e)} className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/50 hover:text-green-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg transition-colors font-medium">Resolve</button>
                          : <span className="text-xs text-green-500 font-semibold">✓</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3">
                <button onClick={() => { navigate("/alerts"); setOpen(false); }} className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline w-full text-center">
                  View all alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2 ml-1 pl-3 border-l border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
            NT
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
