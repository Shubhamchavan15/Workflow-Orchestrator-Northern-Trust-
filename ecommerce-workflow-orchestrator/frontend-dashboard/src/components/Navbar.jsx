import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaSearch, FaUserCircle, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import API from "../services/api";

const Navbar = () => {
  const [alerts, setAlerts]       = useState([]);
  const [open, setOpen]           = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const dropdownRef               = useRef(null);
  const navigate                  = useNavigate();

  const fetchAlerts = () => {
    API.get("/workflows/alerts?limit=20")
      .then((r) => setAlerts(r.data.alerts || []))
      .catch(() => {});
  };

  // Poll every 8 seconds
  useEffect(() => {
    fetchAlerts();
    const id = setInterval(fetchAlerts, 8000);
    return () => clearInterval(id);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unresolved = alerts.filter((a) => !a.resolved);

  const resolve = async (execution_id, e) => {
    e.stopPropagation();
    try {
      await API.patch(`/workflows/alerts/${execution_id}/resolve`);
      fetchAlerts();
    } catch {}
  };

  const getIcon = (title = "", message = "") => {
    const t = (title + message).toLowerCase();
    if (t.includes("payment") || t.includes("declined")) return "💳";
    if (t.includes("inventory") || t.includes("stock"))  return "📦";
    if (t.includes("shipping"))                           return "🚚";
    return "⚠️";
  };

  return (
    <div className="bg-white h-20 shadow-sm flex items-center justify-between px-8 relative z-50">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      <div className="flex items-center gap-6 text-2xl text-gray-600">
        <FaSearch className="cursor-pointer hover:text-blue-500 transition-colors" />

        {/* Bell with live badge */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative focus:outline-none"
            aria-label="Notifications"
          >
            <FaBell
              className={`cursor-pointer transition-colors ${
                unresolved.length > 0 ? "text-red-500 animate-pulse" : "hover:text-blue-500"
              }`}
            />
            {unresolved.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">
                {unresolved.length > 9 ? "9+" : unresolved.length}
              </span>
            )}
          </button>

          {/* Dropdown panel */}
          {open && (
            <div className="absolute right-0 top-10 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                <span className="font-bold text-gray-800 text-base">Notifications</span>
                {unresolved.length > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                    {unresolved.length} unresolved
                  </span>
                )}
              </div>

              {/* Alert list */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {alerts.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">
                    <FaCheckCircle className="text-3xl mx-auto mb-2 text-green-400" />
                    <p className="text-sm">All clear — no alerts</p>
                  </div>
                ) : (
                  alerts.slice(0, 10).map((alert, i) => (
                    <div
                      key={i}
                      className={`px-5 py-4 flex gap-3 items-start hover:bg-gray-50 transition-colors ${
                        alert.resolved ? "opacity-50" : ""
                      }`}
                    >
                      <span className="text-xl mt-0.5 shrink-0">
                        {getIcon(alert.title, alert.message)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{alert.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {alert.created_at?.slice(0, 19).replace("T", " ")}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {!alert.resolved ? (
                          <button
                            onClick={(e) => resolve(alert.execution_id, e)}
                            className="text-xs bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-600 px-2 py-1 rounded-lg transition-colors font-medium"
                          >
                            Resolve
                          </button>
                        ) : (
                          <span className="text-xs text-green-500 font-semibold">✓ Done</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
                <button
                  onClick={() => { navigate("/alerts"); setOpen(false); }}
                  className="text-sm text-blue-600 font-semibold hover:underline w-full text-center"
                >
                  View all alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        <FaUserCircle className="text-4xl cursor-pointer hover:text-blue-500 transition-colors" />
      </div>
    </div>
  );
};

export default Navbar;
