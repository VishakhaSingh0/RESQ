import { useState, useEffect } from 'react';
import './Settings.css';

function Settings() {
  const [notifications, setNotifications] = useState(true);

  const [theme, setTheme] = useState(
    () => localStorage.getItem('nexora-theme') || 'Light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark-mode',
      theme === 'Dark'
    );

    localStorage.setItem('nexora-theme', theme);
  }, [theme]);

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <p>Manage your NEXORA application preferences.</p>

      <div className="settings-card">
        <h3>Profile Settings</h3>
        <p>Admin Profile</p>
        <p>Email: admin@nexora.example</p>
      </div>

      <div className="settings-card">
        <h3>Notification Preferences</h3>
        <label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
          Enable Notifications
        </label>
      </div>

      <div className="settings-card">
        <h3>Appearance</h3>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="Light">Light Mode</option>
          <option value="Dark">Dark Mode</option>
        </select>
      </div>

      <div className="settings-card">
        <h3>About NEXORA</h3>
        <p>NEXORA - Disaster Management System</p>
        <p>Version 1.0</p>
      </div>
    </div>
  );
}

export default Settings;