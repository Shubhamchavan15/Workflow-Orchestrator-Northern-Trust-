import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const TASK_ORDER = ["order_received", "inventory", "payment", "shipping", "notification", "completed"];

const taskColor = (s) => {
  if (s === "COMPLETED") return "bg-green-500";
  if (s === "RUNNING")   return "bg-blue-500 animate-pulse";
  if (s === "FAILED")    return "bg-red-500";
  return "bg-gray-300 dark:bg-gray-600";
};

const statusBadge = (s) => {
  if (s === "COMPLETED") return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
  if (s === "RUNNING")   return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300";
  if (s === "FAILED")    return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
  return "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400";
};

const Executions = () => {
  const [executions, setExecutions] = useState([]);

  useEffect(() => {
    API.get("/workflows/executions?limit=20")
      .then(r => setExecutions(r.data.executions || []))
      .catch(() => {});
  }, []);

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-full transition-colors duration-300">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Executions</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Monitor live workflow execution progress</p>
      </div>

      {executions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-xl dark:text-gray-300">No executions yet.</p>
          <p className="text-sm mt-2">Place an order from the User Portal to see executions here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {executions.map((ex) => {
            const taskStates = ex.task_states || {};
            return (
              <div key={ex.execution_id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 transition-colors duration-300">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{ex.execution_id}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                      Order: {ex.order_id} · {ex.customer_name} · ₹{ex.amount?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusBadge(ex.status)}`}>{ex.status}</span>
                    <Link to={`/executions/${ex.execution_id}`}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all font-semibold text-sm">
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {TASK_ORDER.map((taskId, idx) => {
                    const state = taskStates[taskId] || "PENDING";
                    return (
                      <div key={taskId} className="flex items-center gap-2">
                        <div className={`px-4 py-2.5 rounded-2xl text-white font-semibold text-xs shadow-sm ${taskColor(state)}`}>
                          {taskId.replace(/_/g, " ")}
                        </div>
                        {idx < TASK_ORDER.length - 1 && (
                          <span className="text-gray-300 dark:text-gray-600 text-lg">→</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Executions;
