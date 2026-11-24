
import { useEffect, useState, useCallback } from 'react';
import './Alerts.css';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

const API_URL = `${API_BASE_URL}/alerts`;

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Other');
  const [severity, setSeverity] = useState('Medium');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');

  // Load alerts from MongoDB
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to load alerts');
      }

      setAlerts(result.data);
      setError('');
    } catch (err) {
      console.error('Error loading alerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and automatic refresh every 5 minutes
  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchAlerts]);
  const refreshOfficialAlerts = async () => {
  setRefreshing(true);
  setRefreshMessage('');

  try {
    const response = await fetch(`${API_URL}/refresh`, {
      method: 'POST',
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Refresh failed');
    }

    await fetchAlerts();

    setRefreshMessage(
      `${result.message}. ${result.data.inserted} new alerts found.`
    );
  } catch (err) {
    setRefreshMessage(`Refresh failed: ${err.message}`);
  } finally {
    setRefreshing(false);
  }
};
  // Rule-based priority suggestion
  const classifyAlert = () => {
    if (!title.trim()) {
      window.alert('Please enter an alert title first');
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

  // Add manual alert
  const addAlert = async (e) => {
    e.preventDefault();

    if (!title.trim() || !location.trim()) {
      window.alert('Please fill all fields');
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
          category,
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
      setCategory('Other');
      setSeverity('Medium');
      setAiSuggestion('');

      window.alert('Alert added successfully!');
    } catch (err) {
      window.alert(err.message);
    }
  };

  // Resolve manual alert
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
        prev.map((item) => item._id === id ? result.data : item)
      );
    } catch (err) {
      window.alert(err.message);
    }
  };

  // Delete manual alert
  const deleteAlert = async (id) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete alert');
      }

      setAlerts((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      window.alert(err.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not specified';
    }

    return parsedDate.toLocaleString();
  };

  const activeCount = alerts.filter(
    (item) => item.status === 'Active'
  ).length;

  const officialCount = alerts.filter(
    (item) => item.alertType === 'Official'
  ).length;

  const manualCount = alerts.filter(
    (item) => item.alertType !== 'Official'
  ).length;

  return (
    <div className="alerts-container">
      <h2>Emergency Alerts</h2>
      <p>Monitor official disaster warnings and manage manual alerts.</p>

      <div className="alert-summary">
        <div className="alert-summary-card">
          <h3>{activeCount}</h3>
          <p>Active Alerts</p>
        </div>

        <div className="alert-summary-card">
          <h3>{officialCount}</h3>
          <p>Official Alerts</p>
        </div>

        <div className="alert-summary-card">
          <h3>{manualCount}</h3>
          <p>Manual Alerts</p>
        </div>
      </div>

     <button
  type="button"
  onClick={refreshOfficialAlerts}
  className="refresh-alerts-button"
  disabled={refreshing}
>
  {refreshing ? 'Refreshing...' : 'Refresh Alerts'}
</button>

{refreshMessage && (
  <p role="status">{refreshMessage}</p>
)}

      <h3>Add Manual Alert</h3>

      <form onSubmit={addAlert} className="alert-form">
        <input
          type="text"
          placeholder="Alert Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setAiSuggestion('');
          }}
          required
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setAiSuggestion('');
          }}
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Medical emergency">Medical emergency</option>
          <option value="Fire">Fire</option>
          <option value="Flood">Flood</option>
          <option value="Accident">Accident</option>
          <option value="Other">Other</option>
        </select>

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
            emergency assessment.
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
        <h3>All Disaster Alerts</h3>

        {loading && <p>Loading alerts...</p>}

        {error && (
          <p className="alert-error">
            {error}
          </p>
        )}

        {!loading && !error && alerts.length === 0 && (
          <p>No alerts available yet.</p>
        )}

        {alerts.map((item) => {
          const isOfficial = item.alertType === 'Official';

          return (
            <div className="alert-item" key={item._id}>
              <div className="alert-badges">
                <span className={isOfficial ? 'official-badge' : 'manual-badge'}>
                  {isOfficial ? 'Official Alert' : 'Manual Alert'}
                </span>

                <span className="category-badge">
                  {item.category || 'Other'}
                </span>

                <span className="severity-badge">
                  {item.severity}
                </span>
              </div>

              <h3>{item.title}</h3>

              <p><strong>Location:</strong> {item.location}</p>

              <p><strong>Status:</strong> {item.status}</p>

              {item.description && (
                <p><strong>Description:</strong> {item.description}</p>
              )}

              {item.affectedAreas?.length > 0 && (
                <p>
                  <strong>Affected Areas:</strong>{' '}
                  {item.affectedAreas.join(', ')}
                </p>
              )}

              {isOfficial && (
                <>
                  <p>
                    <strong>Source:</strong>{' '}
                    {item.sourceName || 'NDMA SACHET'}
                  </p>

                  <p>
                    <strong>Verification:</strong>{' '}
                    {item.verificationStatus || 'Unverified'}
                  </p>

                  <p>
                    <strong>Issued:</strong>{' '}
                    {formatDate(item.issuedAt)}
                  </p>

                  <p>
                    <strong>Expires:</strong>{' '}
                    {formatDate(item.expiresAt)}
                  </p>

                  
                 {item.sourceUrl && (
                  <a
                  href="https://sachet.ndma.gov.in/"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="official-source-link"
                     >
                   View Official Source ↗
                   </a>
                    )}

                </>
              )}

              {!isOfficial && item.status === 'Active' && (
                <button
                  type="button"
                  onClick={() => resolveAlert(item._id)}
                >
                  Mark Resolved
                </button>
              )}

              {!isOfficial && (
                <button
                  type="button"
                  onClick={() => deleteAlert(item._id)}
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Alerts;
