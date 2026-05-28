const Settings = () => {
  return (
    <div className="p-8">

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Settings
        </h1>

        <p className="text-gray-500 mt-2">
          Configure orchestration settings
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-8 space-y-8">

        <div>
          <label className="block text-gray-700 font-semibold mb-3">
            Max Retry Attempts
          </label>

          <input
            type="number"
            defaultValue="3"
            className="border border-gray-300 px-4 py-3 rounded-xl w-40"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-3">
            Notification Email
          </label>

          <input
            type="email"
            placeholder="admin@example.com"
            className="border border-gray-300 px-4 py-3 rounded-xl w-full"
          />
        </div>

        <div className="flex items-center gap-4">

          <input type="checkbox" defaultChecked />

          <label className="text-gray-700 font-semibold">
            Enable Slack Notifications
          </label>

        </div>

        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all">
          Save Settings
        </button>

      </div>

    </div>
  );
};

export default Settings;