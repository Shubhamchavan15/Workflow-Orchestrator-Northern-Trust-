import { useEffect, useState } from "react";
import {
  FaCheckCircle, FaExclamationTriangle, FaPlayCircle, FaProjectDiagram,
  FaArrowUp, FaArrowDown,
} from "react-icons/fa";
import WorkflowTable from "../components/WorkflowTable";
import RecentActivity from "../components/RecentActivity";
import WorkflowChart from "../components/WorkflowChart";
import API from "../services/api";

const STAT_CONFIG = [
  {
    key: "total_workflows",
    label: "Total Workflows",
    icon: FaProjectDiagram,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-950",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-600 dark:text-violet-400",
  },
  {
    key: "running",
    label: "Running",
    icon: FaPlayCircle,
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "completed",
    label: "Completed",
    icon: FaCheckCircle,
    gradient: "from-emerald-500 to-green-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "failed",
    label: "Failed",
    icon: FaExclamationTriangle,
    gradient: "from-red-500 to-rose-500",
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-600 dark:text-red-400",
  },
];

const StatCard = ({ config, value, total }) => {
  const { label, icon: Icon, gradient, bg, border, text } = config;
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border ${border} p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}>
      {/* Gradient accent top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`text-xl ${text}`} />
        </div>
        {total > 0 && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${bg} ${text}`}>
            {pct}%
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-4xl font-bold ${text}`}>{value}</p>

      {/* Mini progress bar */}
      {total > 0 && (
        <div className="mt-4 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({ total_workflows: 0, running: 0, completed: 0, failed: 0 });

  useEffect(() => {
    const fetch = () => API.get("/dashboard/stats").then(r => setStats(r.data)).catch(() => {});
    fetch();
    const id = setInterval(fetch, 15000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-full transition-colors duration-300">

      {/* Page header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-1">{greeting} 👋</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {STAT_CONFIG.map(cfg => (
          <StatCard key={cfg.key} config={cfg} value={stats[cfg.key]} total={stats.total_workflows} />
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2"><WorkflowTable /></div>
        <RecentActivity />
      </div>

      <WorkflowChart />
    </div>
  );
};

export default Dashboard;
