import { useEffect, useState } from "react";
import API from "../services/api";
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaPaperPlane, FaSave } from "react-icons/fa";

const Settings = () => {
  const [form, setForm] = useState({ notification_email: "", max_retries: 3, slack_enabled: false });
  const [saveStatus, setSaveStatus]   = useState(null);
  const [testStatus, setTestStatus]   = useState(null);
  const [testMessage, setTestMessage] = useState("");
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    API.get("/settings")
      .then(r => setForm({ notification_email: r.data.notification_email || "", max_retries: r.data.max_retries ?? 3, slack_enabled: r.data.slack_enabled ?? false }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setSaveStatus(null); setTestStatus(null);
  };

  const handleSave = async () => {
    setSaveStatus(null);
    try { await API.post("/settings", { ...form, max_retries: Number(form.max_retries) }); setSaveStatus("success"); }
    catch { setSaveStatus("error"); }
  };

  const handleTestEmail = async () => {
    if (!form.notification_email) { setTestStatus("error"); setTestMessage("Enter an email address first."); return; }
    setTestStatus("sending"); setTestMessage("");
    try {
      const res = await API.post("/settings/test-email", { notification_email: form.notification_email, max_retries: Number(form.max_retries), slack_enabled: form.slack_enabled });
      setTestStatus(res.data.success ? "success" : "error");
      setTestMessage(res.data.message);
    } catch { setTestStatus("error"); setTestMessage("Could not reach the notification service. Is it running on port 8004?"); }
  };

  if (loading) return <div className="p-8 text-gray-400 dark:text-gray-500">Loading settings…</div>;

  const inputCls = "w-full pl-9 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all";
  const labelCls = "block text-gray-700 dark:text-gray-200 font-semibold mb-2";
  const subCls   = "text-gray-400 dark:text-gray-500 text-sm mb-3";
  const hrCls    = "border-gray-100 dark:border-gray-700";

  return (
    <div className="p-8 max-w-2xl bg-gray-50 dark:bg-gray-950 min-h-full transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Configure orchestration and notification settings</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 space-y-8">

        {/* Max Retries */}
        <div>
          <label className={labelCls}>Max Retry Attempts</label>
          <p className={subCls}>How many times the engine retries a failed task before giving up.</p>
          <input type="number" name="max_retries" value={form.max_retries} onChange={handleChange} min={1} max={10}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-3 rounded-xl w-32 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        </div>

        <hr className={hrCls} />

        {/* Notification Email */}
        <div>
          <label className={labelCls}>Admin Notification Email</label>
          <p className={subCls}>Alerts for payment failures and workflow errors will be sent to this address.</p>
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
              <input type="email" name="notification_email" value={form.notification_email} onChange={handleChange} placeholder="admin@example.com" className={inputCls} />
            </div>
            <button onClick={handleTestEmail} disabled={testStatus === "sending"}
              className="flex items-center gap-2 px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all disabled:opacity-60 text-sm whitespace-nowrap">
              <FaPaperPlane /> {testStatus === "sending" ? "Sending…" : "Send Test"}
            </button>
          </div>
          {testStatus === "success" && <div className="mt-3 flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-xl px-4 py-3 text-sm"><FaCheckCircle /> {testMessage}</div>}
          {testStatus === "error"   && <div className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl px-4 py-3 text-sm"><FaTimesCircle /> {testMessage}</div>}
        </div>

        <hr className={hrCls} />

        {/* Slack */}
        <div className="flex items-center gap-4">
          <input type="checkbox" name="slack_enabled" checked={form.slack_enabled} onChange={handleChange} className="w-5 h-5 accent-blue-600 cursor-pointer" />
          <div>
            <p className="text-gray-700 dark:text-gray-200 font-semibold">Enable Slack Notifications</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Send alerts to a Slack channel (configure webhook in .env)</p>
          </div>
        </div>

        <hr className={hrCls} />

        {/* Save */}
        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold">
            <FaSave /> Save Settings
          </button>
          {saveStatus === "success" && <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm"><FaCheckCircle /> Settings saved</span>}
          {saveStatus === "error"   && <span className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm"><FaTimesCircle /> Failed to save</span>}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 text-sm text-blue-700 dark:text-blue-300">
        <p className="font-semibold mb-1">How notifications work</p>
        <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
          <li>When a customer's payment fails, they receive an email automatically.</li>
          <li>The admin email above also receives an alert with full order details.</li>
          <li>Use "Send Test" to verify the notification service is reachable.</li>
          <li>Notifications are logged in the execution logs (visible on Track Order).</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
