
import { useEffect, useState } from 'react';
import './Alerts.css';

const API_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1') +
  '/alerts';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState('Medium');

  // Load alerts from MongoDB
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to load alerts');
      }

      setAlerts(result.data);
    } catch (error) {
      console.error('Error loading alerts:', error);
      alert(error.message);
    }
  };

  // Add alert
  const addAlert = async (e) => {
    e.preventDefault();

    if (!title.trim() || !location.trim()) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          location,
          severity,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to add alert');
      }

      setAlerts((prev) => [result.data, ...prev]);

      setTitle('');
      setLocation('');
      setSeverity('Medium');

      alert('Alert added successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  // Resolve alert
  const resolveAlert = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Resolved',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to resolve alert');
      }

      setAlerts((prev) =>
        prev.map((alert) =>
          alert._id === id ? result.data : alert
        )
      );
    } catch (error) {
      alert(error.message);
    }
  };

  // Delete alert
  const deleteAlert = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete alert');
      }

      setAlerts((prev) =>
        prev.filter((alert) => alert._id !== id)
      );
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="alerts-container">
      <h2>Emergency Alerts</h2>
      <p>Manage important disaster alerts here.</p>

      <form onSubmit={addAlert} className="alert-form">
        <input
          type="text"
          placeholder="Alert Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <button type="submit">Add Alert</button>
      </form>

      <div className="alerts-list">
        {alerts.length === 0 && <p>No alerts added yet.</p>}

        {alerts.map((alert) => (
          <div className="alert-item" key={alert._id}>
            <h3>{alert.title}</h3>
            <p>Location: {alert.location}</p>
            <p>Severity: {alert.severity}</p>
            <p>Status: {alert.status}</p>

            {alert.status === 'Active' && (
              <button
                onClick={() => resolveAlert(alert._id)}
              >
                Mark Resolved
              </button>
            )}

            <button onClick={() => deleteAlert(alert._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alerts;
