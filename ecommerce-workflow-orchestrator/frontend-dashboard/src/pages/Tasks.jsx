import { useEffect, useState } from "react";
import API from "../services/api";

const statusStyle = (s) => {
  if (s === "Healthy") return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
  if (s === "Warning") return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
  return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
};

const serviceIcon = (name) => {
  if (name === "payment")      return "💳";
  if (name === "inventory")    return "📦";
  if (name === "shipping")     return "🚚";
  if (name === "notification") return "🔔";
  return "⚙️";
};

const Tasks = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    API.get("/dashboard/service-health")
      .then(r => setServices(r.data.services || []))
      .catch(() => {});
  }, []);

  const fallback = [
    { name: "inventory",    status: "Healthy", success_rate: "—", total: 0, success: 0, failed: 0 },
    { name: "payment",      status: "Healthy", success_rate: "—", total: 0, success: 0, failed: 0 },
    { name: "shipping",     status: "Healthy", success_rate: "—", total: 0, success: 0, failed: 0 },
    { name: "notification", status: "Healthy", success_rate: "—", total: 0, success: 0, failed: 0 },
  ];

  const display = services.length > 0 ? services : fallback;

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-full transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Tasks</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Microservice task performance</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {display.map((task, i) => {
          const rate = typeof task.success_rate === "string"
            ? parseFloat(task.success_rate) || 0
            : task.success_rate || 0;
          return (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg transition-colors duration-300">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">{serviceIcon(task.name)}</span>
                  <span className="capitalize">{task.name} Service</span>
                </h2>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusStyle(task.status)}`}>
                  {task.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Success Rate</span>
                  <span className="font-bold text-gray-700 dark:text-gray-200">{task.success_rate}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${rate >= 90 ? "bg-green-500" : rate >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${Math.min(rate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{task.total}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{task.success ?? "—"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Success</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{task.failed}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Failed</p>
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
