import React, { useState, useEffect } from 'react';

interface Settings {
  theme: string;
  duration: string;
  priority: string;
  other_preferences: string; // Assuming this will be a JSON string
}

interface SettingsFormProps {
  onBack: () => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<Settings>({
    theme: 'General',
    duration: 'Daily',
    priority: 'Medium',
    other_preferences: '{}',
  });

  useEffect(() => {
    // Fetch settings on component mount
    window.electronAPI.getSettings();

    const unsubscribeUpdated = window.electronAPI.onSettingsUpdated((updatedSettings: Settings) => {
      setSettings(updatedSettings);
    });

    const unsubscribeError = window.electronAPI.onSettingsError((error: string) => {
      console.error("Error from main process (settings):", error);
      // Handle error
    });

    return () => {
      unsubscribeUpdated();
      unsubscribeError();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value
    }));
  };

  const handleSave = () => {
    window.electronAPI.updateSettings(settings);
    onBack(); // Go back after saving
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">AI Settings</h2>
      <div>
        <label htmlFor="theme" className="block text-sm font-medium text-gray-700">Theme</label>
        <select
          id="theme"
          name="theme"
          value={settings.theme}
          onChange={handleInputChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="General">General</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Fitness">Fitness</option>
          {/* Add more themes as needed */}
        </select>
      </div>
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration</label>
        <select
          id="duration"
          name="duration"
          value={settings.duration}
          onChange={handleInputChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          {/* Add more durations as needed */}
        </select>
      </div>
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          id="priority"
          name="priority"
          value={settings.priority}
          onChange={handleInputChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          {/* Add more priorities as needed */}
        </select>
      </div>
      {/* Add more settings fields here */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors duration-200"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsForm;
