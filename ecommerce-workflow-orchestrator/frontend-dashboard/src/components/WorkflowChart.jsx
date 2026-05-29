import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import API from "../services/api";

const COLORS = { Running: "#3B82F6", Completed: "#22C55E", Failed: "#EF4444" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{label || payload[0]?.name}</p>
      <p style={{ color: payload[0]?.fill || payload[0]?.color }} className="font-bold text-lg">{payload[0]?.value}</p>
    </div>
  );
};

const WorkflowChart = () => {
  const [data, setData] = useState([
    { name: "Running",   value: 0 },
    { name: "Completed", value: 0 },
    { name: "Failed",    value: 0 },
  ]);
  const [view, setView] = useState("bar"); // bar | pie

  useEffect(() => {
    API.get("/dashboard/workflow-chart")
      .then(r => setData(r.data.chart_data || data))
      .catch(() => {});
  }, []);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Workflow Analytics</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{total} total executions</p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {["bar", "pie"].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all capitalize ${
                view === v ? "bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"
              }`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {view === "bar" ? (
            <BarChart data={data} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((d, i) => <Cell key={i} fill={COLORS[d.name] || "#6366f1"} />)}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie data={data} dataKey="value" outerRadius={90} innerRadius={45} paddingAngle={3}>
                {data.map((d, i) => <Cell key={i} fill={COLORS[d.name] || "#6366f1"} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600 dark:text-gray-300">{v}</span>} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 mt-5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[d.name] }} />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{d.name}</p>
              <p className="text-base font-bold text-gray-800 dark:text-white">{d.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowChart;
