
import { useEffect, useState } from "react";
import "./CitizenStatusPanel.css";

const API_URL = "http://localhost:5001/api/v1/citizens";

function CitizenStatusPanel() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCitizens() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch citizens");
        }

        setCitizens(result.data);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to load citizen records. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCitizens();

    return () => controller.abort();
  }, []);

  return (
    <section className="citizen-panel">
      <div className="citizen-panel-header">
        <div>
          <h2>Citizen Status</h2>
          <p>Track emergency requests and rescue progress</p>
        </div>
        <span className="demo-label">LIVE DATA</span>
      </div>

      {loading ? (
        <p role="status">Loading citizen records...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : citizens.length === 0 ? (
        <p>No citizen requests found yet.</p>
      ) : (
        <div className="citizen-list">
          {citizens.map((citizen) => (
            <article className="citizen-card" key={citizen.id}>
              <div className="citizen-card-top">
                <div>
                  <h3>{citizen.name}</h3>
                  <span className="citizen-id">{citizen.id}</span>
                </div>

                <span
                  className={`status-badge status-${citizen.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {citizen.status}
                </span>
              </div>

              <div className="citizen-details">
                <p>
                  <strong>Location:</strong> {citizen.location}
                </p>
                <p>
                  <strong>Emergency:</strong> {citizen.emergency}
                </p>
                <p>
                  <strong>Severity:</strong>{" "}
                  <span
                    className={`severity severity-${citizen.severity.toLowerCase()}`}
                  >
                    {citizen.severity}
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CitizenStatusPanel;

