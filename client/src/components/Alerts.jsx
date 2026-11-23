
import { useEffect, useState } from 'react';
import './Alerts.css';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

const API_URL = `${API_BASE_URL}/alerts`;

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [aiSuggestion, setAiSuggestion] = useState('');

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

  // Free local priority suggestion (rule-based)
  const classifyAlert = () => {
    if (!title.trim()) {
      alert('Please enter an alert title first');
      return;
    }

    const alertText = `${title} ${location}`.toLowerCase();

    let suggestedSeverity = 'Low';

    const highKeywords = [
      'flood',
      'earthquake',
      'fire',
      'cyclone',
      'landslide',
      'building collapse',
      'severe',
      'rescue',
    ];

    const mediumKeywords = [
      'rain',
      'waterlogging',
      'road blocked',
      'storm',
      'power outage',
    ];

    if (highKeywords.some((word) => alertText.includes(word))) {
      suggestedSeverity = 'High';
    } else if (mediumKeywords.some((word) => alertText.includes(word))) {
      suggestedSeverity = 'Medium';
    }

    setAiSuggestion(suggestedSeverity);
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
        body: JSON.stringify({ title, location, severity }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to add alert');
      }

      setAlerts((prev) => [result.data, ...prev]);
      setTitle('');
      setLocation('');
      setSeverity('Medium');
      setAiSuggestion('');

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
        body: JSON.stringify({ status: 'Resolved' }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to resolve alert');
      }

      setAlerts((prev) =>
        prev.map((alert) => alert._id === id ? result.data : alert)
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

      setAlerts((prev) => prev.filter((alert) => alert._id !== id));
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
          onChange={(e) => {
            setTitle(e.target.value);
            setAiSuggestion('');
          }}
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setAiSuggestion('');
          }}
        />

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <button type="button" onClick={classifyAlert}>
          Suggest Priority
        </button>

        <button type="submit">Add Alert</button>
      </form>

      {aiSuggestion && (
        <div className="ai-suggestion">
          <h3>Priority Suggestion</h3>
          <p>
            Suggested Severity: <strong>{aiSuggestion}</strong>
          </p>
          <p>
            This is a rule-based demo suggestion, not a verified
            emergency assessment. Please review it yourself.
          </p>
          <button
            type="button"
            onClick={() => setSeverity(aiSuggestion)}
          >
            Use This Priority
          </button>
        </div>
      )}

      <div className="alerts-list">
        {alerts.length === 0 && <p>No alerts added yet.</p>}

        {alerts.map((alert) => (
          <div className="alert-item" key={alert._id}>
            <h3>{alert.title}</h3>
            <p>Location: {alert.location}</p>
            <p>Severity: {alert.severity}</p>
            <p>Status: {alert.status}</p>

            {alert.status === 'Active' && (
              <button onClick={() => resolveAlert(alert._id)}>
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
