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
      .then((r) => setData(r.data.chart_data || data))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Workflow Analytics</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" outerRadius={110} label>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkflowChart;
