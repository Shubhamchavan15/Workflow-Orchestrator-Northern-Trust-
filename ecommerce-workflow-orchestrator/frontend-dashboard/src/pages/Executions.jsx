import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const TASK_ORDER = ["order_received", "payment", "inventory", "shipping", "notification", "completed"];

const taskColor = (s) => {
  if (s === "COMPLETED") return "bg-green-500";
  if (s === "RUNNING")   return "bg-blue-500";
  if (s === "FAILED")    return "bg-red-500";
  return "bg-yellow-400";
};

const Executions = () => {
  const [executions, setExecutions] = useState([]);

  useEffect(() => {
    API.get("/workflows/executions?limit=20")
      .then((r) => setExecutions(r.data.executions || []))
      .catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Executions</h1>
        <p className="text-gray-500 mt-2">Monitor live workflow execution progress</p>
      </div>

      {executions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl">No executions yet.</p>
          <p className="text-sm mt-2">Place an order from the User Portal to see executions here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {executions.map((ex) => {
            const taskStates = ex.task_states || {};
            return (
              <div key={ex.execution_id} className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{ex.execution_id}</h2>
                    <p className="text-gray-500 mt-1 text-sm">
                      Order: {ex.order_id} · {ex.customer_name}
                    </p>
                  </div>
                  <Link
                    to={`/executions/${ex.execution_id}`}
                    className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold text-sm"
                  >
                    View Details
                  </Link>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  {TASK_ORDER.map((taskId, idx) => {
                    const state = taskStates[taskId] || "PENDING";
                    return (
                      <div key={taskId} className="flex items-center gap-3">
                        <div className={`px-4 py-3 rounded-2xl text-white font-semibold shadow-md text-sm ${taskColor(state)}`}>
                          {taskId.replace("_", " ")}
                        </div>
                        {idx < TASK_ORDER.length - 1 && (
                          <span className="text-2xl text-gray-300">→</span>
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
