import { useEffect, useState } from "react";
import API from "../services/api";

const statusStyle = (s) => {
  if (s === "Healthy") return "bg-green-500";
  if (s === "Warning") return "bg-yellow-500";
  return "bg-red-500";
};

const Tasks = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    API.get("/dashboard/service-health")
      .then((r) => setServices(r.data.services || []))
      .catch(() => {});
  }, []);

  const fallback = [
    { name: "payment",      status: "Healthy", success_rate: "—", total: 0, failed: 0 },
    { name: "inventory",    status: "Healthy", success_rate: "—", total: 0, failed: 0 },
    { name: "shipping",     status: "Healthy", success_rate: "—", total: 0, failed: 0 },
    { name: "notification", status: "Healthy", success_rate: "—", total: 0, failed: 0 },
  ];

  const display = services.length > 0 ? services : fallback;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Tasks</h1>
        <p className="text-gray-500 mt-2">Microservice task performance</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {display.map((task, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 capitalize">{task.name} Service</h2>
              <span className={`px-4 py-2 rounded-full text-white text-sm ${statusStyle(task.status)}`}>
                {task.status}
              </span>
            </div>
            <div className="space-y-3 text-gray-600 text-sm">
              <p><span className="font-semibold text-gray-800">Total Executions:</span> {task.total}</p>
              <p><span className="font-semibold text-gray-800">Successful:</span> {task.success ?? "—"}</p>
              <p><span className="font-semibold text-gray-800">Failed:</span> {task.failed}</p>
              <p><span className="font-semibold text-gray-800">Success Rate:</span> {task.success_rate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
