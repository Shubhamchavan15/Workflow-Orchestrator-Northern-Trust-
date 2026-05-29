import { useEffect, useRef, useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import { FaCircle } from "react-icons/fa";
import API from "../services/api";

const getLogLevel = (msg = "") => {
  const m = msg.toLowerCase();
  if (m.includes("fail") || m.includes("error"))      return { label: "ERROR", color: "text-red-400",    dot: "bg-red-500" };
  if (m.includes("complet") || m.includes("success")) return { label: "INFO",  color: "text-green-400",  dot: "bg-green-500" };
  if (m.includes("start") || m.includes("running"))   return { label: "INFO",  color: "text-blue-400",   dot: "bg-blue-500" };
  if (m.includes("warn"))                             return { label: "WARN",  color: "text-yellow-400", dot: "bg-yellow-500" };
  return { label: "DEBUG", color: "text-gray-400", dot: "bg-gray-500" };
};

const Logs = () => {
  const [logs, setLogs]         = useState([]);
  const [filter, setFilter]     = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef               = useRef(null);

  const fetchLogs = () => {
    API.get("/dashboard/recent-activity?limit=100")
      .then(r => setLogs(r.data.activity || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, autoScroll]);

  const filtered = logs.filter(l =>
    l.message?.toLowerCase().includes(filter.toLowerCase()) ||
    l.execution_id?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-full transition-colors duration-300 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Logs</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Real-time orchestration logs · refreshes every 5s</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
            <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} className="accent-blue-600" />
            Auto-scroll
          </label>
          <input type="text" placeholder="Filter logs…" value={filter} onChange={e => setFilter(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-2 rounded-xl outline-none w-56 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all" />
          <button onClick={fetchLogs}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl hover:border-blue-300 transition-all">
            <HiOutlineRefresh /> Refresh
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
        {/* Terminal header bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-800">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-3 text-xs text-gray-500 font-mono">orchestrator — logs</span>
          <div className="ml-auto flex items-center gap-1.5">
            <FaCircle className="text-green-500 text-[8px] animate-pulse" />
            <span className="text-xs text-gray-500">{filtered.length} entries</span>
          </div>
        </div>

        {/* Log entries */}
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto max-h-[calc(100vh-280px)] space-y-1">
          {filtered.length === 0 ? (
            <p className="text-gray-600 py-4">No logs yet. Place an order to generate logs.</p>
          ) : (
            filtered.map((log, i) => {
              const level = getLogLevel(log.message);
              return (
                <div key={i} className="flex gap-3 items-start hover:bg-white/5 px-2 py-1 rounded-lg transition-colors group">
                  <span className="text-gray-600 shrink-0 tabular-nums">
                    {log.timestamp?.slice(11, 19)}
                  </span>
                  <span className={`shrink-0 font-bold w-12 ${level.color}`}>{level.label}</span>
                  <span className="text-blue-400 shrink-0 truncate max-w-[120px]">[{log.execution_id?.slice(0, 12)}]</span>
                  <span className={`flex-1 ${level.color} leading-relaxed`}>{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};

export default Logs;
