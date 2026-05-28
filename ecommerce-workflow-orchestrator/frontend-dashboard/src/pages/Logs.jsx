import { useEffect, useState } from "react";
import API from "../services/api";

const Logs = () => {
  const [logs, setLogs]     = useState([]);
  const [filter, setFilter] = useState("");

  const fetchLogs = () => {
    API.get("/dashboard/recent-activity?limit=100")
      .then((r) => setLogs(r.data.activity || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.message?.toLowerCase().includes(filter.toLowerCase()) ||
      l.execution_id?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Logs</h1>
          <p className="text-gray-500 mt-2">Real-time orchestration logs (auto-refreshes every 5s)</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Filter logs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-xl outline-none w-64"
          />
          <button
            onClick={fetchLogs}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-gray-900 text-green-400 rounded-3xl p-6 font-mono shadow-lg min-h-64 max-h-[70vh] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-gray-500">No logs yet. Place an order to generate logs.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((log, i) => (
              <div key={i} className="border-b border-gray-800 pb-3 last:border-0">
                <span className="text-gray-500 text-xs">
                  [{log.timestamp?.slice(0, 19).replace("T", " ")}]
                </span>{" "}
                <span className="text-blue-400 text-xs">[{log.execution_id}]</span>{" "}
                <span className="text-gray-200 text-sm">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
