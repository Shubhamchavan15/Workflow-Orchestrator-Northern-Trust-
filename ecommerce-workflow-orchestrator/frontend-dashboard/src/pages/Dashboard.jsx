import { useEffect, useState } from "react";
import {
  FaCheckCircle, FaExclamationTriangle, FaPlayCircle, FaProjectDiagram,
} from "react-icons/fa";
import WorkflowTable from "../components/WorkflowTable";
import RecentActivity from "../components/RecentActivity";
import WorkflowChart from "../components/WorkflowChart";
import API from "../services/api";

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500">{label}</p>
        <h2 className={`text-4xl font-bold mt-3 ${color}`}>{value}</h2>
      </div>
      <Icon className={`text-4xl ${color}`} />
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ total_workflows: 0, running: 0, completed: 0, failed: 0 });

  useEffect(() => {
    API.get("/dashboard/stats")
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <div className="grid grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Workflows" value={stats.total_workflows} color="text-purple-500" icon={FaProjectDiagram} />
        <StatCard label="Running"          value={stats.running}         color="text-blue-500"   icon={FaPlayCircle} />
        <StatCard label="Completed"        value={stats.completed}       color="text-green-500"  icon={FaCheckCircle} />
        <StatCard label="Failed"           value={stats.failed}          color="text-red-500"    icon={FaExclamationTriangle} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2"><WorkflowTable /></div>
        <RecentActivity />
      </div>

      <div className="mt-10"><WorkflowChart /></div>
    </div>
  );
};

export default Dashboard;
