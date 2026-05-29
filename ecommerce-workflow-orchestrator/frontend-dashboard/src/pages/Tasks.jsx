import { useEffect, useState } from "react";
import API from "../services/api";

const SERVICE_CONFIG = {
  inventory:    { icon: "📦", gradient: "from-blue-500 to-cyan-500",    bg: "bg-blue-50 dark:bg-blue-950",    text: "text-blue-600 dark:text-blue-400" },
  payment:      { icon: "💳", gradient: "from-violet-500 to-purple-600", bg: "bg-violet-50 dark:bg-violet-950", text: "text-violet-600 dark:text-violet-400" },
  shipping:     { icon: "🚚", gradient: "from-orange-500 to-amber-500",  bg: "bg-orange-50 dark:bg-orange-950", text: "text-orange-600 dark:text-orange-400" },
  notification: { icon: "🔔", gradient: "from-pink-500 to-rose-500",    bg: "bg-pink-50 dark:bg-pink-950",    text: "text-pink-600 dark:text-pink-400" },
};

const statusConfig = {
  Healthy: { badge: "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800", dot: "bg-green-500" },
  Warning: { badge: "bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800", dot: "bg-yellow-500" },
  Failed:  { badge: "bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800", dot: "bg-red-500" },
};

const FALLBACK = [
  { name: "inventory",    status: "Healthy", success_rate: "—", total: 0, success: 0, failed: 0 },
  { name: "payment",      status: "Healthy", success_rate: "—", total: 0, success: 0, failed: 0 },
  { name: "shipping",     status: "Healthy", success_rate: "—", total: 0, success: 0, failed: 0 },
  { name: "notification", status: "Healthy", success_rate: "—", total: 0, success: 0, failed: 0 },
];

const Tasks = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    API.get("/dashboard/service-health")
      .then(r => { setServices(r.data.services || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const display = services.length > 0 ? services : FALLBACK;

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-full transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Microservice health and performance</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {display.map((task, i) => {
          const cfg    = SERVICE_CONFIG[task.name] || SERVICE_CONFIG.notification;
          const scfg   = statusConfig[task.status] || statusConfig.Healthy;
          const rate   = typeof task.success_rate === "string" ? parseFloat(task.success_rate) || 0 : task.success_rate || 0;
          const barColor = rate >= 90 ? "from-green-500 to-emerald-400" : rate >= 70 ? "from-yellow-500 to-amber-400" : "from-red-500 to-rose-400";

          return (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200">
              {/* Gradient top bar */}
              <div className={`h-1 bg-gradient-to-r ${cfg.gradient}`} />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center text-xl`}>
                      {cfg.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{task.name} Service</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${scfg.dot}`} />
                        <span className="text-xs text-gray-400 dark:text-gray-500">{task.status}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${scfg.badge}`}>{task.success_rate}</span>
                </div>

                {/* Progress bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-2">
                    <span>Success Rate</span>
                    <span className={`font-semibold ${cfg.text}`}>{task.success_rate}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.min(rate, 100)}%` }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total",   value: task.total,          color: "text-gray-800 dark:text-white",          bg: "bg-gray-50 dark:bg-gray-700/50" },
                    { label: "Success", value: task.success ?? "—", color: "text-green-600 dark:text-green-400",     bg: "bg-green-50 dark:bg-green-900/30" },
                    { label: "Failed",  value: task.failed,         color: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-900/30" },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                      <p className={`text-xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tasks;
