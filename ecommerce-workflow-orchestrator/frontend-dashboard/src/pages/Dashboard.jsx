import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlayCircle,
  FaProjectDiagram,
} from "react-icons/fa";

import WorkflowTable from "../components/WorkflowTable";
import RecentActivity from "../components/RecentActivity";
import WorkflowChart from "../components/WorkflowChart";

const Dashboard = () => {
  return (
    <div className="p-8">
      {/* Top Cards */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">
                Total Workflows
              </p>

              <h2 className="text-4xl font-bold mt-3">
                24
              </h2>
            </div>

            <FaProjectDiagram className="text-4xl text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Running</p>

              <h2 className="text-4xl font-bold text-blue-500 mt-3">
                8
              </h2>
            </div>

            <FaPlayCircle className="text-4xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">
                Completed
              </p>

              <h2 className="text-4xl font-bold text-green-500 mt-3">
                128
              </h2>
            </div>

            <FaCheckCircle className="text-4xl text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Failed</p>

              <h2 className="text-4xl font-bold text-red-500 mt-3">
                3
              </h2>
            </div>

            <FaExclamationTriangle className="text-4xl text-red-500" />
          </div>
        </div>
      </div>

      {/* Table + Activity */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <WorkflowTable />
        </div>

        <RecentActivity />
      </div>
      <div className="mt-10">
         <WorkflowChart />
      </div>
    </div>
  );
};

export default Dashboard;