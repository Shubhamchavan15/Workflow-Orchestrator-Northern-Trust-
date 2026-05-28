const workflows = [
  {
    workflowId: "WF-1001",
    orderId: "ORD-501",
    name: "Order Processing",
    status: "Running",
    currentTask: "Shipping",
  },
  {
    workflowId: "WF-1002",
    orderId: "ORD-502",
    name: "Inventory Sync",
    status: "Completed",
    currentTask: "Done",
  },
  {
    workflowId: "WF-1003",
    orderId: "ORD-503",
    name: "Payment Validation",
    status: "Failed",
    currentTask: "Payment",
  },
];

const WorkflowTable = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Recent Workflows
        </h2>

        <input
          type="text"
          placeholder="Search..."
          className="border px-4 py-2 rounded-lg outline-none"
        />
      </div>

      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-4">Workflow ID</th>
            <th className="pb-4">Order ID</th>
            <th className="pb-4">Workflow</th>
            <th className="pb-4">Status</th>
            <th className="pb-4">Current Task</th>
          </tr>
        </thead>

        <tbody>
          {workflows.map((workflow) => (
            <tr
              key={workflow.workflowId}
              className="border-b hover:bg-gray-50"
            >
              <td className="py-4 font-semibold">
                {workflow.workflowId}
              </td>

              <td>{workflow.orderId}</td>

              <td>{workflow.name}</td>

              <td>
                <span
                  className={`px-3 py-1 rounded-full text-white text-sm ${
                    workflow.status === "Running"
                      ? "bg-blue-500"
                      : workflow.status === "Completed"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {workflow.status}
                </span>
              </td>

              <td>{workflow.currentTask}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkflowTable;