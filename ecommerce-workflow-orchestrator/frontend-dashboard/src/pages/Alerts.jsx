const alerts = [
  {
    title: "Shipping Service Timeout",
    severity: "Critical",
  },
  {
    title: "Inventory Delay Detected",
    severity: "Warning",
  },
  {
    title: "Workflow WF-1003 Failed",
    severity: "Critical",
  },
];

const Alerts = () => {
  return (
    <div className="p-8">

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Alerts
        </h1>

        <p className="text-gray-500 mt-2">
          Monitor workflow incidents and failures
        </p>
      </div>

      <div className="space-y-6">

        {alerts.map((alert, index) => (

          <div
            key={index}
            className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-6 flex justify-between items-center"
          >

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {alert.title}
              </h2>
            </div>

            <span
              className={`px-5 py-2 rounded-full text-white font-semibold ${
                alert.severity === "Critical"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            >
              {alert.severity}
            </span>

          </div>

        ))}

      </div>

    </div>
  );
};

export default Alerts;