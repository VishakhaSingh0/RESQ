
import "./CitizenStatusPanel.css";

const demoCitizens = [
  {
    id: "RESQ-101",
    name: "Aarav Sharma",
    location: "Gandhi Maidan, Patna",
    emergency: "Medical Emergency",
    severity: "High",
    status: "Pending",
  },
  {
    id: "RESQ-102",
    name: "Priya Kumari",
    location: "Rajendra Nagar, Patna",
    emergency: "Flood Rescue",
    severity: "Critical",
    status: "Rescue Assigned",
  },
  {
    id: "RESQ-103",
    name: "Rahul Kumar",
    location: "Kankarbagh, Patna",
    emergency: "Food & Water",
    severity: "Medium",
    status: "Rescued",
  },
];

function CitizenStatusPanel() {
  return (
    <section className="citizen-panel">
      <div className="citizen-panel-header">
        <div>
          <h2>Citizen Status</h2>
          <p>Track emergency requests and rescue progress</p>
        </div>
        <span className="demo-label">DEMO DATA</span>
      </div>

      <div className="citizen-list">
        {demoCitizens.map((citizen) => (
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
    </section>
  );
}

export default CitizenStatusPanel;
