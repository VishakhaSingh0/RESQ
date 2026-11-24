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

  // Restore saved Dark Mode or Light Mode
  useEffect(() => {
    const savedTheme =
      localStorage.getItem('nexora-theme') || 'Light';

    document.documentElement.classList.toggle(
      'dark-mode',
      savedTheme === 'Dark'
    );
  }, []);

  // API Health Check
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
        setError(err.message || 'Unable to connect to NEXORA API.');
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
                  NEXORA EMERGENCY RESPONSE PLATFORM
                </p>

                <h1>Welcome to NEXORA</h1>

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

              {/* Live Map */}
              <article className="overview-card live-map-card">
                <LiveMap />
              </article>

              {/* Emergency Alerts */}
              <article className="overview-card">
                <span className="card-label">
                  PUBLIC SAFETY
                </span>

                <h2>Emergency Alerts</h2>

                <p>
                  Important disaster alerts will appear here.
                </p>
              </article>

              {/* Shelters */}
              <article className="overview-card">
                <span className="card-label">
                  SUPPORT
                </span>

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

              {/* Citizen Status */}
              <article className="overview-card citizen-status-card">
                <CitizenStatusPanel />
              </article>

              {/* Emergency Form */}
              <article className="overview-card emergency-form-card">
                <EmergencyForm />
              </article>

            </section>
          </>
        )}

        {/* Shelter Management */}
        {activePage === 'Shelters' && (
          <ShelterModule />
        )}

        {/* Rescue Team Management */}
        {activePage === 'Rescue Teams' && (
          <RescueTeam />
        )}

        {/* Citizen Management */}
        {activePage === 'Citizens' && (
          <section className="overview-card">
            <CitizenStatusPanel />
          </section>
        )}

        {/* Live Map */}
        {activePage === 'Live Map' && (
          <section className="overview-card">
            <h2>Live Map</h2>
            <LiveMap />
          </section>
        )}

        {/* Disaster Alerts */}
        {activePage === 'Alerts' && (
          <Alerts />
        )}

        {/* Settings */}
        {activePage === 'Settings' && (
          <Settings />
        )}

      </main>
    </div>
  );
}

export default App;