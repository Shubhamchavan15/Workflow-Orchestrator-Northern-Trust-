import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome, FaProjectDiagram, FaTasks,
  FaFileAlt, FaBell, FaCog, FaListAlt,
} from "react-icons/fa";
import { MdOutlineWorkspaces } from "react-icons/md";
import API from "../services/api";

const NAV = [
  { to: "/",           label: "Overview",   icon: FaHome },
  { to: "/workflows",  label: "Workflows",  icon: FaProjectDiagram },
  { to: "/executions", label: "Executions", icon: FaListAlt },
  { to: "/tasks",      label: "Tasks",      icon: FaTasks },
  { to: "/logs",       label: "Logs",       icon: FaFileAlt },
  { to: "/alerts",     label: "Alerts",     icon: FaBell },
  { to: "/settings",   label: "Settings",   icon: FaCog },
];

const Sidebar = () => {
  const location                    = useLocation();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const fetch = () => {
      API.get("/workflows/alerts?limit=100")
        .then(r => setAlertCount((r.data.alerts || []).filter(a => !a.resolved).length))
        .catch(() => {});
    };
    fetch();
    const id = setInterval(fetch, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-60 min-h-screen bg-slate-900 dark:bg-gray-950 text-white flex flex-col transition-colors duration-300 border-r border-slate-800 dark:border-gray-800">

      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
            <MdOutlineWorkspaces className="text-white text-lg" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Orchestrator</p>
            <p className="text-xs text-slate-400">Northern Trust</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">Menu</p>
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-gray-800"
              }`}>
              <Icon className={`text-base shrink-0 transition-colors ${active ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
              <span className="flex-1">{label}</span>
              {label === "Alerts" && alertCount > 0 && (
                <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${active ? "bg-white text-blue-600" : "bg-red-500 text-white"}`}>
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-slate-400">All services online</span>
        </div>
        <p className="text-xs text-slate-600 mt-1">v1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
