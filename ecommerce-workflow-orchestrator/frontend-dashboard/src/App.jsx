import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Workflows from "./pages/Workflows";
import Executions from "./pages/Executions";
import WorkflowDetails from "./pages/WorkflowDetails";
import Tasks from "./pages/Tasks";
import Logs from "./pages/Logs";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/"              element={<Dashboard />} />
                <Route path="/workflows"     element={<Workflows />} />
                <Route path="/executions"    element={<Executions />} />
                <Route path="/executions/:id" element={<WorkflowDetails />} />
                <Route path="/tasks"         element={<Tasks />} />
                <Route path="/logs"          element={<Logs />} />
                <Route path="/alerts"        element={<Alerts />} />
                <Route path="/settings"      element={<Settings />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
