import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Running", value: 8 },
  { name: "Completed", value: 18 },
  { name: "Failed", value: 3 },
];

const COLORS = [
  "#3B82F6",
  "#22C55E",
  "#EF4444",
];

const WorkflowChart = () => {
  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-6">

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Workflow Analytics
      </h2>

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              outerRadius={110}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />

          </PieChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default WorkflowChart;