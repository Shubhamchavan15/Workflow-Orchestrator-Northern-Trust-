import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import API from "../services/api";

const COLORS = ["#3B82F6", "#22C55E", "#EF4444"];

const WorkflowChart = () => {
  const [data, setData] = useState([
    { name: "Running",   value: 0 },
    { name: "Completed", value: 0 },
    { name: "Failed",    value: 0 },
  ]);

  useEffect(() => {
    API.get("/dashboard/workflow-chart")
      .then(r => setData(r.data.chart_data || data))
      .catch(() => {});
  }, []);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Workflow Analytics</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">{total} total executions</span>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" outerRadius={100} innerRadius={50} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tooltip-bg, #fff)",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "13px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {data.map((d, i) => (
          <div key={i} className="text-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-700">
            <p className="text-2xl font-bold" style={{ color: COLORS[i] }}>{d.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{d.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowChart;
