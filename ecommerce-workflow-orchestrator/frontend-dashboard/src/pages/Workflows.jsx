const workflows = [
  {
    workflowId: "WF-1001",
    orderId: "ORD-501",
    status: "Running",
    currentTask: "Shipping",
    duration: "2m 15s",
  },
  {
    workflowId: "WF-1002",
    orderId: "ORD-502",
    status: "Completed",
    currentTask: "Done",
    duration: "5m 42s",
  },
  {
    workflowId: "WF-1003",
    orderId: "ORD-503",
    status: "Failed",
    currentTask: "Payment",
    duration: "1m 10s",
  },
  {
    workflowId: "WF-1004",
    orderId: "ORD-504",
    status: "Running",
    currentTask: "Inventory",
    duration: "3m 01s",
  },
];

const Workflows = () => {
  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold text-gray-800">
          Workflows
        </h1>

        <input
          type="text"
          placeholder="Search workflows..."
          className="border border-gray-300 px-5 py-3 rounded-xl outline-none w-80 bg-white shadow-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8">

        <button className="bg-blue-600 text-white px-5 py-2 rounded-xl">
          All
        </button>

        <button className="bg-white shadow-sm px-5 py-2 rounded-xl">
          Running
        </button>

        <button className="bg-white shadow-sm px-5 py-2 rounded-xl">
          Completed
        </button>

        <button className="bg-white shadow-sm px-5 py-2 rounded-xl">
          Failed
        </button>

      </div>

      {/* Workflow Cards */}
      <div className="grid grid-cols-2 gap-6">

        {workflows.map((workflow) => (

          <div
            key={workflow.workflowId}
            className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >

            <div className="flex justify-between items-center mb-6">

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {workflow.workflowId}
                </h2>

                <p className="text-gray-500 mt-1">
                  Order ID: {workflow.orderId}
                </p>
              </div>

              <span
                className={`px-4 py-2 rounded-full text-white text-sm font-semibold ${
                  workflow.status === "Running"
                    ? "bg-blue-500"
                    : workflow.status === "Completed"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {workflow.status}
              </span>

            </div>

            <div className="space-y-3 text-gray-600">

              <p>
                <span className="font-semibold text-gray-800">
                  Current Task:
                </span>{" "}
                {workflow.currentTask}
              </p>

              <p>
                <span className="font-semibold text-gray-800">
                  Duration:
                </span>{" "}
                {workflow.duration}
              </p>

            </div>

            <button className="mt-6 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition-all">
              View Details
            </button>

          </div>

        ))}

      </div>

    </div>
  );
};

export default Workflows;