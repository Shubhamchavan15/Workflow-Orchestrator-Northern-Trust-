import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBackOutline, IoPlayOutline, IoPauseOutline, IoRefreshOutline, IoCloseCircleOutline } from 'react-icons/io5';
import DAGVisualizer from '../components/DAGVisualizer';

const mockExecutionsData = {
  "WF-1001": {
    id: "WF-1001",
    customer: "John Doe",
    total: "₹12,450",
    status: "running",
    taskStatuses: {
      payment: 'completed',
      inventory: 'completed',
      shipping: 'running',
      notification: 'pending',
      complete: 'pending',
    },
    logs: [
      { time: "2026-05-28 21:05:01", message: "Workflow started for Order #1001" },
      { time: "2026-05-28 21:05:03", message: "Step 'payment' initiated (POST :8001/process)" },
      { time: "2026-05-28 21:05:06", message: "Payment processed successfully: TXN-A98F72 (Charged)" },
      { time: "2026-05-28 21:05:08", message: "Step 'inventory' initiated (POST :8002/check)" },
      { time: "2026-05-28 21:05:10", message: "Inventory verified. 2 items reserved in stock." },
      { time: "2026-05-28 21:05:12", message: "Step 'shipping' initiated (POST :8003/dispatch)" },
      { time: "2026-05-28 21:05:15", message: "Awaiting shipping carrier response..." }
    ]
  },
  "WF-1002": {
    id: "WF-1002",
    customer: "Alice Smith",
    total: "₹4,899",
    status: "completed",
    taskStatuses: {
      payment: 'completed',
      inventory: 'completed',
      shipping: 'completed',
      notification: 'completed',
      complete: 'completed',
    },
    logs: [
      { time: "2026-05-28 19:40:00", message: "Workflow started for Order #1002" },
      { time: "2026-05-28 19:40:02", message: "Step 'payment' processed: TXN-B12D34" },
      { time: "2026-05-28 19:40:04", message: "Step 'inventory' verified stock availability" },
      { time: "2026-05-28 19:40:06", message: "Step 'shipping' tracking number generated: NT_SHIP_987654" },
      { time: "2026-05-28 19:40:08", message: "n8n Webhook triggered for notification channel: email" },
      { time: "2026-05-28 19:40:10", message: "Workflow execution completed successfully." }
    ]
  },
  "WF-1003": {
    id: "WF-1003",
    customer: "Bob Johnson",
    total: "₹23,500",
    status: "failed",
    taskStatuses: {
      payment: 'failed',
      inventory: 'pending',
      shipping: 'pending',
      notification: 'pending',
      complete: 'pending',
    },
    logs: [
      { time: "2026-05-28 20:10:00", message: "Workflow started for Order #1003" },
      { time: "2026-05-28 20:10:03", message: "Step 'payment' initiated (POST :8001/process)" },
      { time: "2026-05-28 20:10:05", message: "Payment failed: Card declined (Insufficient funds)" },
      { time: "2026-05-28 20:10:07", message: "Retry #1: Step 'payment' initiated" },
      { time: "2026-05-28 20:10:09", message: "Payment failed: Card declined (Insufficient funds)" },
      { time: "2026-05-28 20:10:11", message: "Retry #2: Step 'payment' initiated" },
      { time: "2026-05-28 20:10:13", message: "Payment failed: Card declined (Insufficient funds)" },
      { time: "2026-05-28 20:10:15", message: "Max retries (3) reached. Marking step 'payment' as FAILED." },
      { time: "2026-05-28 20:10:16", message: "Workflow execution terminated due to error." }
    ]
  }
};

const WorkflowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Look up execution or fall back to WF-1001
  const executionId = id || "WF-1001";
  const initialData = mockExecutionsData[executionId] || mockExecutionsData["WF-1001"];
  
  const [status, setStatus] = useState(initialData.status);
  const [taskStatuses, setTaskStatuses] = useState({ ...initialData.taskStatuses });
  const [logs, setLogs] = useState([...initialData.logs]);

  // Simulate execution progress for demonstration if status is 'running'
  useEffect(() => {
    if (status !== 'running') return;

    const timer = setTimeout(() => {
      setTaskStatuses(prev => ({
        ...prev,
        shipping: 'completed',
        notification: 'running'
      }));
      setLogs(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString(), message: "Shipping dispatched. Tracking generated: NT_SHIP_MOCK99" },
        { time: new Date().toLocaleTimeString(), message: "Step 'notification' initiated (Triggering n8n webhook)" }
      ]);
    }, 4000);

    const finishTimer = setTimeout(() => {
      setTaskStatuses(prev => ({
        ...prev,
        notification: 'completed',
        complete: 'completed'
      }));
      setStatus('completed');
      setLogs(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString(), message: "n8n Webhook returned 200 OK. Notification sent." },
        { time: new Date().toLocaleTimeString(), message: "Workflow execution completed successfully." }
      ]);
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [status]);

  const handlePause = () => {
    setStatus('paused');
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: "Workflow execution paused by Admin." }]);
  };

  const handleResume = () => {
    setStatus('running');
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: "Workflow execution resumed by Admin." }]);
  };

  const handleTerminate = () => {
    setStatus('failed');
    // Set all pending/running tasks to failed/skipped
    setTaskStatuses(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        if (updated[k] === 'running') updated[k] = 'failed';
      });
      return updated;
    });
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: "Workflow execution terminated by Admin." }]);
  };

  const handleRetry = () => {
    setStatus('running');
    setTaskStatuses({
      payment: 'completed',
      inventory: 'completed',
      shipping: 'running',
      notification: 'pending',
      complete: 'pending',
    });
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: "Retrying failed tasks..." }]);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Back Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/executions')}
          className="p-3 bg-white hover:bg-gray-100 text-gray-700 rounded-2xl shadow-sm transition-all"
        >
          <IoArrowBackOutline size={20} />
        </button>
        <div>
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Execution Details</span>
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            {executionId}
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              status === 'completed' ? 'bg-green-100 text-green-700' :
              status === 'running' ? 'bg-blue-100 text-blue-700' :
              status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {status}
            </span>
          </h1>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-3xl shadow-lg shadow-gray-100 p-6 mb-8 flex justify-between items-center flex-wrap gap-4 border border-gray-100">
        <div>
          <p className="text-gray-500 text-sm font-medium">Customer: <b className="text-gray-800">{initialData.customer}</b></p>
          <p className="text-gray-500 text-sm font-medium mt-1">Order Value: <b className="text-gray-800">{initialData.total}</b></p>
        </div>
        
        <div className="flex gap-3">
          {status === 'running' && (
            <button 
              onClick={handlePause}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-md shadow-yellow-100"
            >
              <IoPauseOutline size={18} /> Pause
            </button>
          )}
          {status === 'paused' && (
            <button 
              onClick={handleResume}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-md shadow-blue-100"
            >
              <IoPlayOutline size={18} /> Resume
            </button>
          )}
          {status === 'failed' && (
            <button 
              onClick={handleRetry}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-md shadow-green-100"
            >
              <IoRefreshOutline size={18} /> Retry
            </button>
          )}
          {status !== 'completed' && status !== 'failed' && (
            <button 
              onClick={handleTerminate}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-md shadow-red-100"
            >
              <IoCloseCircleOutline size={18} /> Terminate
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DAG Column */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg shadow-gray-100 p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Workflow Graph (DAG)</h2>
          <DAGVisualizer taskStatuses={taskStatuses} />
        </div>

        {/* Logs Column */}
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-100 p-6 border border-gray-100 flex flex-col h-[610px]">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Execution Logs</h2>
          <div className="flex-1 bg-gray-900 rounded-2xl p-4 overflow-y-auto font-mono text-xs text-green-400 space-y-3">
            {logs.map((log, index) => (
              <div key={index} className="border-b border-gray-800 pb-2 last:border-0">
                <span className="text-gray-500 font-semibold">[{log.time}]</span>{" "}
                <span className="text-gray-200">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetails;
