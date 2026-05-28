import { useEffect, useState } from "react";
import API from "../services/api";

const RecentActivity = () => {
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    API.get("/dashboard/recent-activity?limit=8")
      .then((r) => setActivity(r.data.activity || []))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
      {activity.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">No activity yet.</p>
      ) : (
        <div className="space-y-4">
          {activity.map((item, i) => (
            <div key={i} className="border-b pb-3 last:border-0">
              <p className="text-gray-700 text-sm">{item.message}</p>
              <p className="text-gray-400 text-xs mt-1">
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
