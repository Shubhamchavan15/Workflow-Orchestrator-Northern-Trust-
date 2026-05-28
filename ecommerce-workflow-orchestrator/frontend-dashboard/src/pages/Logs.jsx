const logs = [
  "[12:01] Workflow WF-1001 started",
  "[12:02] Payment completed successfully",
  "[12:03] Inventory synced",
  "[12:04] Shipping task failed",
  "[12:05] Retry triggered for Shipping",
  "[12:06] Shipping completed",
];

const Logs = () => {
  return (
    <div className="p-8">

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Logs
        </h1>

        <p className="text-gray-500 mt-2">
          Real-time orchestration logs
        </p>
      </div>

      <div className="bg-black text-green-400 rounded-3xl p-6 font-mono shadow-lg">

        <div className="space-y-4">

          {logs.map((log, index) => (

            <div
              key={index}
              className="border-b border-gray-800 pb-3"
            >
              {log}
            </div>

          ))}

        </div>

      </div>

    </div>
  );
};

export default Logs;