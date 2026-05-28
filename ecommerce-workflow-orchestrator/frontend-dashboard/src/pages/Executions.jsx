import { Link } from "react-router-dom";

const executions = [
  {
    workflowId: "WF-1001",
    tasks: [
      { name: "Payment", status: "completed" },
      { name: "Inventory", status: "completed" },
      { name: "Shipping", status: "running" },
      { name: "Notification", status: "pending" },
    ],
  },

  {
    workflowId: "WF-1002",
    tasks: [
      { name: "Payment", status: "completed" },
      { name: "Inventory", status: "completed" },
      { name: "Shipping", status: "completed" },
      { name: "Notification", status: "completed" },
    ],
  },

  {
    workflowId: "WF-1003",
    tasks: [
      { name: "Payment", status: "failed" },
      { name: "Inventory", status: "pending" },
      { name: "Shipping", status: "pending" },
      { name: "Notification", status: "pending" },
    ],
  },
];

const Executions = () => {
  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          Executions
        </h1>

        <p className="text-gray-500 mt-2">
          Monitor live workflow execution progress
        </p>
      </div>

      {/* Execution Cards */}
      <div className="space-y-8">

        {executions.map((execution) => (

          <div
            key={execution.workflowId}
            className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-8"
          >

            {/* Workflow Header */}
            <div className="flex justify-between items-center mb-8">

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {execution.workflowId}
                </h2>

                <p className="text-gray-500 mt-1">
                  Live Workflow Execution
                </p>
              </div>

              <Link to={`/executions/${execution.workflowId}`} className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold">
                View Details
              </Link>

            </div>

            {/* Task Flow */}
            <div className="flex items-center gap-6 flex-wrap">

              {execution.tasks.map((task, index) => (

                <div
                  key={index}
                  className="flex items-center gap-4"
                >

                  {/* Task Card */}
                  <div
                    className={`px-6 py-4 rounded-2xl text-white font-semibold shadow-md ${
                      task.status === "completed"
                        ? "bg-green-500"
                        : task.status === "running"
                        ? "bg-blue-500"
                        : task.status === "failed"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {task.name}
                  </div>

                  {/* Arrow */}
                  {index !== execution.tasks.length - 1 && (
                    <div className="text-3xl text-gray-400">
                      →
                    </div>
                  )}

                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default Executions;