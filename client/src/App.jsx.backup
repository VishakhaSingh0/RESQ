
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkAPI() {
      try {
        const baseURL =
          import.meta.env.VITE_API_URL ||
          'http://localhost:5001/api/v1';

        const response = await fetch(`${baseURL}/health`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error('The API health check failed.');
        }

        setHealth(result);
      } catch (err) {
        setError(err.message || 'Unable to connect to RESQ API.');
      } finally {
        setLoading(false);
      }
    }

    checkAPI();
  }, []);

  return (
    <main className="app">
      <h1>RESQ</h1>

      <p>
        Location-Aware Disaster Evacuation
        and Rescue Coordination Platform
      </p>

      <section className="health-card">
        <h2>System Status</h2>

        {loading && <p>Checking backend connection...</p>}

        {!loading && health && (
          <>
            <p className="status">Backend API: Running</p>
            <p>Database: {health.data.database}</p>
            <p>{health.message}</p>
          </>
        )}

        {!loading && error && (
          <p className="error">Connection failed: {error}</p>
        )}
      </section>
    </main>
  );
}

export default App;

