import { useEffect, useState } from "react";
import API from "../services/api";

const getLogStyle = (msg = "") => {
  const m = msg.toLowerCase();
  if (m.includes("fail") || m.includes("error"))   return { dot: "bg-red-500",   text: "text-red-600 dark:text-red-400" };
  if (m.includes("complet") || m.includes("success")) return { dot: "bg-green-500", text: "text-green-600 dark:text-green-400" };
  if (m.includes("start") || m.includes("running"))   return { dot: "bg-blue-500 animate-pulse", text: "text-blue-600 dark:text-blue-400" };
  return { dot: "bg-gray-300 dark:bg-gray-600", text: "text-gray-600 dark:text-gray-400" };
};

const RecentActivity = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    API.get("/dashboard/recent-activity?limit=8")
      .then(r => { setActivity(r.data.activity || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Latest log entries</p>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}
          </div>
        ) : activity.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-400">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activity.map((item, i) => {
              const style = getLogStyle(item.message);
              return (
                <div key={i} className="flex gap-3 items-start p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <div className="mt-1.5 shrink-0">
                    <span className={`w-2 h-2 rounded-full block ${style.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium leading-snug truncate ${style.text}`}>{item.message}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {item.timestamp?.slice(11, 19)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
