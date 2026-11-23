
import { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import LiveMap from './components/LiveMap';
import CitizenStatusPanel from './components/CitizenStatusPanel';
import EmergencyForm from './components/EmergencyForm';
import ShelterModule from './components/ShelterModule';
import RescueTeam from './components/RescueTeam';
import Alerts from './components/Alerts';
import Settings from './components/Settings';

function App() {
  const [activePage, setActivePage] = useState('Overview');
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
    <div className="dashboard-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="dashboard-main">

        {activePage === 'Overview' && (
          <>
            <header className="dashboard-header">
              <div>
                <p className="eyebrow">
                  EMERGENCY RESPONSE PLATFORM
                </p>
                <h1>Welcome to RESQ</h1>
                <p className="dashboard-subtitle">
                  Location-Aware Disaster Evacuation and Rescue Coordination
                </p>
              </div>

              <div className="header-badge">
                <span className="header-dot" />
                Live Dashboard
              </div>
            </header>

            <section className="dashboard-cards">

              <article className="overview-card">
                <span className="card-label">SYSTEM</span>
                <h2>System Health</h2>

                {loading && (
                  <p>Checking backend connection...</p>
                )}

                {!loading && health && (
                  <>
                    <p className="status">
                      <span className="status-dot" />
                      Backend API: Running
                    </p>
                    <p>Database: {health.data.database}</p>
                    <p>{health.message}</p>
                  </>
                )}

                {!loading && error && (
                  <p className="error">
                    Connection failed: {error}
                  </p>
                )}
              </article>

              <article className="overview-card live-map-card">
                <LiveMap />
              </article>

              <article className="overview-card">
                <span className="card-label">PUBLIC SAFETY</span>
                <h2>Emergency Alerts</h2>
                <p>Important disaster alerts will appear here.</p>
              </article>

              <article className="overview-card">
                <span className="card-label">SUPPORT</span>
                <h2>Shelters</h2>
                <p>
                  Open Shelter Information from the sidebar
                  to view available shelter details.
                </p>
                <button
                  type="button"
                  onClick={() => setActivePage('Shelters')}
                >
                  View Shelters
                </button>
              </article>

              <article className="overview-card citizen-status-card">
                <CitizenStatusPanel />
              </article>

              <article className="overview-card emergency-form-card">
                <EmergencyForm />
              </article>

            </section>
          </>
        )}

        {activePage === 'Shelters' && (
          <ShelterModule />
        )}
        {activePage === 'Rescue Teams' && (
          <RescueTeam />
      )}
        {activePage === 'Live Map' && (
          <section className="overview-card">
            <h2>Live Map</h2>
            <LiveMap />
          </section>
        )}

        {activePage === 'Alerts' && (
            <Alerts />
              )}

        {activePage === 'Settings' && (
           <Settings />
          )}
      </main>
    </div>
  );
}

export default App;


       
   
        
   

