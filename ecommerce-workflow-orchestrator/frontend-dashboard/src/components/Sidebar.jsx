import { Link } from "react-router-dom";
import {
  FaHome,
  FaProjectDiagram,
  FaTasks,
  FaFileAlt,
  FaBell,
  FaCog,
} from "react-icons/fa";



const Sidebar = () => {
  return (
    <div className="w-56 min-h-screen bg-blue-700 text-white p-6">
      <h1 className="text-3xl font-bold mb-12">
        Orchestrator
      </h1>

      <ul className="space-y-5 text-lg">

        <Link
          to="/"
          className="flex items-center gap-4 bg-blue-500 p-3 rounded-xl cursor-pointer"
        >
          <FaHome />
          Overview
        </Link>

        <Link
          to="/workflows"
          className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-blue-500 transition-all"
        >
          <FaProjectDiagram />
          Workflows
        </Link>

        <Link
          to="/executions"
          className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-blue-500 transition-all"
        >
          <FaTasks />
          Executions
        </Link>

        <Link
          to="/tasks"
          className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-blue-500 transition-all"
        >
          <FaTasks />
          Tasks
        </Link>

        <Link
          to="/logs"
          className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-blue-500 transition-all"
        >
          <FaFileAlt />
          Logs
        </Link>

        <Link
          to="/alerts"
          className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-blue-500 transition-all"
        >
          <FaBell />
          Alerts
        </Link>

        <Link
          to="/settings"
          className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-blue-500 transition-all"
        >
          <FaCog />
          Settings
        </Link>

      </ul>
    </div>
  );
};

export default Sidebar;