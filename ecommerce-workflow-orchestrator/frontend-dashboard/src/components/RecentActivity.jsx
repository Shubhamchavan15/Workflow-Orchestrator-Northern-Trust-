const activities = [
  "Workflow WF-1001 started",
  "Payment task completed",
  "Inventory synced",
  "Shipping task failed",
  "Retry triggered",
];

const RecentActivity = () => {
  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Recent Activity
      </h2>

      <div className="space-y-5">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="border-b pb-3 text-gray-600"
          >
            {activity}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;