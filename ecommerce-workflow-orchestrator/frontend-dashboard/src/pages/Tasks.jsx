const tasks = [
  {
    name: "Payment Service",
    status: "Healthy",
    avgTime: "120ms",
    successRate: "98%",
  },
  {
    name: "Inventory Service",
    status: "Healthy",
    avgTime: "210ms",
    successRate: "95%",
  },
  {
    name: "Shipping Service",
    status: "Warning",
    avgTime: "540ms",
    successRate: "88%",
  },
  {
    name: "Notification Service",
    status: "Failed",
    avgTime: "N/A",
    successRate: "60%",
  },
];

const Tasks = () => {
  return (
    <div className="p-8">

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Tasks
        </h1>

        <p className="text-gray-500 mt-2">
          Monitor microservice task performance
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {tasks.map((task, index) => (

          <div
            key={index}
            className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200"
          >

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold text-gray-800">
                {task.name}
              </h2>

              <span
                className={`px-4 py-2 rounded-full text-white text-sm ${
                  task.status === "Healthy"
                    ? "bg-green-500"
                    : task.status === "Warning"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                {task.status}
              </span>

            </div>

            <div className="space-y-3 text-gray-600">

              <p>
                <span className="font-semibold text-gray-800">
                  Avg Response Time:
                </span>{" "}
                {task.avgTime}
              </p>

              <p>
                <span className="font-semibold text-gray-800">
                  Success Rate:
                </span>{" "}
                {task.successRate}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default Tasks;