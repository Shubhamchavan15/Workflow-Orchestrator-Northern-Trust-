import { useEffect, useState } from "react";
import API from "../services/api";

const RecentActivity = () => {
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    API.get("/dashboard/recent-activity?limit=8")
      .then(r => setActivity(r.data.activity || []))
      .catch(() => {});
  }, []);

  const msgColor = (msg = "") => {
    const m = msg.toLowerCase();
    if (m.includes("fail") || m.includes("error")) return "text-red-500";
    if (m.includes("complet") || m.includes("success")) return "text-green-500";
    if (m.includes("start") || m.includes("running")) return "text-blue-500";
    return "text-gray-400 dark:text-gray-500";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Recent Activity</h2>
      {activity.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">No activity yet.</p>
      ) : (
        <div className="space-y-4">
          {activity.map((item, i) => (
            <div key={i} className="border-b dark:border-gray-700 pb-3 last:border-0">
              <p className={`text-sm font-medium ${msgColor(item.message)}`}>
                {item.message}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                {item.timestamp?.slice(0, 19).replace("T", " ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
