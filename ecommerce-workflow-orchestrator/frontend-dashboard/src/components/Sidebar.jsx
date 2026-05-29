import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaProjectDiagram, FaTasks, FaFileAlt, FaBell, FaCog, FaListAlt } from "react-icons/fa";
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
    <div className="w-56 min-h-screen bg-blue-700 dark:bg-gray-900 text-white p-6 flex flex-col transition-colors duration-300 border-r border-blue-800 dark:border-gray-800">
      <h1 className="text-2xl font-bold mb-10 tracking-tight">Orchestrator</h1>

      <ul className="space-y-2 text-base flex-1">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <li key={to}>
              <Link to={to}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium ${
                  active
                    ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-md"
                    : "hover:bg-blue-600 dark:hover:bg-gray-800 text-white"
                }`}>
                <Icon className="text-lg shrink-0" />
                <span className="flex-1">{label}</span>
                {label === "Alerts" && alertCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                    {alertCount > 9 ? "9+" : alertCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 pt-4 border-t border-blue-600 dark:border-gray-700 text-xs text-blue-300 dark:text-gray-500 text-center">
        v1.0.0 · NT Orchestrator
      </div>
    </div>
  );
};

export default Sidebar;
