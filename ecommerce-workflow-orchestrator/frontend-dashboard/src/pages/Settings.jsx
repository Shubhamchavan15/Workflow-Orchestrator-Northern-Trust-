import { useEffect, useState } from "react";
import API from "../services/api";
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaPaperPlane, FaSave } from "react-icons/fa";

const Settings = () => {
  const [form, setForm] = useState({
    notification_email: "",
    max_retries:        3,
    slack_enabled:      false,
  });

  const [saveStatus, setSaveStatus]   = useState(null);  // "success" | "error"
  const [testStatus, setTestStatus]   = useState(null);  // "success" | "error" | "sending"
  const [testMessage, setTestMessage] = useState("");
  const [loading, setLoading]         = useState(true);

  // Load saved settings on mount
  useEffect(() => {
    API.get("/settings")
      .then((r) => {
        setForm({
          notification_email: r.data.notification_email || "",
          max_retries:        r.data.max_retries ?? 3,
          slack_enabled:      r.data.slack_enabled ?? false,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setSaveStatus(null);
    setTestStatus(null);
  };

  const handleSave = async () => {
    setSaveStatus(null);
    try {
      await API.post("/settings", {
        ...form,
        max_retries: Number(form.max_retries),
      });
      setSaveStatus("success");
    } catch {
      setSaveStatus("error");
    }
  };

  const handleTestEmail = async () => {
    if (!form.notification_email) {
      setTestStatus("error");
      setTestMessage("Enter an email address first.");
      return;
    }
    setTestStatus("sending");
    setTestMessage("");
    try {
      const res = await API.post("/settings/test-email", {
        notification_email: form.notification_email,
        max_retries:        Number(form.max_retries),
        slack_enabled:      form.slack_enabled,
      });
      if (res.data.success) {
        setTestStatus("success");
        setTestMessage(res.data.message);
      } else {
        setTestStatus("error");
        setTestMessage(res.data.message);
      }
    } catch {
      setTestStatus("error");
      setTestMessage("Could not reach the notification service. Is it running on port 8004?");
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading settings…</div>;

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 mt-2">Configure orchestration and notification settings</p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-8 space-y-8">

        {/* Max Retries */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Max Retry Attempts
          </label>
          <p className="text-gray-400 text-sm mb-3">
            How many times the engine retries a failed task before giving up.
          </p>
          <input
            type="number"
            name="max_retries"
            value={form.max_retries}
            onChange={handleChange}
            min={1}
            max={10}
            className="border border-gray-300 px-4 py-3 rounded-xl w-32 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <hr className="border-gray-100" />

        {/* Notification Email */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Admin Notification Email
          </label>
          <p className="text-gray-400 text-sm mb-3">
            Alerts for payment failures and workflow errors will be sent to this address.
            A test email is sent immediately when you click "Send Test".
          </p>

          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="email"
                name="notification_email"
                value={form.notification_email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <button
              onClick={handleTestEmail}
              disabled={testStatus === "sending"}
              className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all disabled:opacity-60 text-sm whitespace-nowrap"
            >
              <FaPaperPlane />
              {testStatus === "sending" ? "Sending…" : "Send Test"}
            </button>
          </div>

          {/* Test email feedback */}
          {testStatus === "success" && (
            <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
              <FaCheckCircle /> {testMessage}
            </div>
          )}
          {testStatus === "error" && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              <FaTimesCircle /> {testMessage}
            </div>
          )}
        </div>

        <hr className="border-gray-100" />

        {/* Slack toggle */}
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            name="slack_enabled"
            checked={form.slack_enabled}
            onChange={handleChange}
            className="w-5 h-5 accent-blue-600 cursor-pointer"
          />
          <div>
            <p className="text-gray-700 font-semibold">Enable Slack Notifications</p>
            <p className="text-gray-400 text-sm">Send alerts to a Slack channel (configure webhook in .env)</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold"
          >
            <FaSave /> Save Settings
          </button>

          {saveStatus === "success" && (
            <span className="flex items-center gap-2 text-green-600 font-semibold text-sm">
              <FaCheckCircle /> Settings saved
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-2 text-red-600 font-semibold text-sm">
              <FaTimesCircle /> Failed to save
            </span>
          )}
        </div>

      </div>

      {/* Info box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-700">
        <p className="font-semibold mb-1">How notifications work</p>
        <ul className="list-disc list-inside space-y-1 text-blue-600">
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
