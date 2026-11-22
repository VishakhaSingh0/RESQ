
import { useState } from "react";
import "./EmergencyForm.css";

const API_URL = "http://localhost:5001/api/v1/citizens";

const emergencyTypes = [
  { value: "Medical emergency", icon: "✚", label: "Medical" },
  { value: "Fire", icon: "♨", label: "Fire" },
  { value: "Flood", icon: "〰", label: "Flood" },
  { value: "Accident", icon: "🚑", label: "Accident" },
  { value: "Other", icon: "•••", label: "Other" },
];

const severityLevels = [
  { value: "Low", label: "Low", description: "Non-critical" },
  { value: "Medium", label: "Medium", description: "Needs attention" },
  { value: "High", label: "High", description: "Urgent response" },
  { value: "Critical", label: "Critical", description: "Highest urgency" },
];

function EmergencyForm() {
  const [form, setForm] = useState({
    name: "",
    location: "",
    emergency: "Medical emergency",
    severity: "High",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const payload = {
      citizenId: `RESQ-${Date.now()}`,
      name: form.name.trim(),
      location: form.location.trim(),
      emergency: form.emergency,
      severity: form.severity,
      status: "Pending",
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit request.");
      }

      setMessage(
        `Request submitted successfully! Your ID is ${result.data.id}.`
      );

      setForm({
        name: "",
        location: "",
        emergency: "Medical emergency",
        severity: "High",
      });
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Please check that the backend is running."
          : err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="emergency-page">
      <div className="emergency-main-card">
        <header className="emergency-heading">
          <div className="emergency-heading-icon" aria-hidden="true">
            <span>!</span>
          </div>
          <div>
            <span className="emergency-eyebrow">RESQ • CITIZEN SUPPORT</span>
            <h2>Emergency Request</h2>
            <p>Share the details below so your request can be reviewed.</p>
          </div>
        </header>

        <div className="emergency-notice">
          <span aria-hidden="true">ⓘ</span>
          <p>
            Please provide accurate details about the emergency and its
            location.
          </p>
        </div>

        <form className="emergency-form" onSubmit={handleSubmit}>
          <div className="emergency-field">
            <label htmlFor="emergency-name">
              Full name <span>*</span>
            </label>
            <input
              id="emergency-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter the citizen's full name"
              autoComplete="name"
              maxLength={100}
              required
            />
          </div>

          <div className="emergency-field">
            <label htmlFor="emergency-location">
              Emergency location <span>*</span>
            </label>
            <input
              id="emergency-location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Address, area or nearby landmark"
              maxLength={200}
              required
            />
            <small>Include a clear landmark if possible.</small>
          </div>

          <fieldset className="emergency-choice-group">
            <legend>
              Emergency type <span>*</span>
            </legend>
            <div className="emergency-type-grid">
              {emergencyTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`emergency-type-option ${
                    form.emergency === type.value ? "selected" : ""
                  }`}
                  aria-pressed={form.emergency === type.value}
                  onClick={() =>
                    handleChange({
                      target: { name: "emergency", value: type.value },
                    })
                  }
                >
                  <span className="emergency-type-icon" aria-hidden="true">
                    {type.icon}
                  </span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="emergency-choice-group">
            <legend>
              Severity level <span>*</span>
            </legend>
            <div className="emergency-severity-grid">
              {severityLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  className={`emergency-severity-option severity-${level.value.toLowerCase()} ${
                    form.severity === level.value ? "selected" : ""
                  }`}
                  aria-pressed={form.severity === level.value}
                  onClick={() =>
                    handleChange({
                      target: { name: "severity", value: level.value },
                    })
                  }
                >
                  <span className="severity-dot" />
                  <strong>{level.label}</strong>
                  <small>{level.description}</small>
                </button>
              ))}
            </div>
          </fieldset>

          {error && (
            <p className="emergency-feedback error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="emergency-feedback success" role="status">
              {message}
            </p>
          )}

          <button className="emergency-submit" type="submit" disabled={loading}>
            {loading ? (
              "Submitting request..."
            ) : (
              <>
                <span aria-hidden="true">➤</span> Submit Emergency Request
              </>
            )}
          </button>

          <p className="emergency-privacy">
            <span aria-hidden="true">🔒</span> Submit only accurate information.
            This form sends your request to the RESQ server.
          </p>
        </form>
      </div>

      <aside className="emergency-help-card">
        <div className="emergency-help-banner">
          <div className="emergency-help-symbol" aria-hidden="true">✚</div>
          <div>
            <h3>Need assistance?</h3>
            <p>Choose the category that best describes the situation.</p>
          </div>
        </div>

        <h4>Emergency guide</h4>

        <div className="emergency-guide-item">
          <span className="guide-icon medical">✚</span>
          <div>
            <strong>Medical emergency</strong>
            <p>Injury or urgent medical assistance</p>
          </div>
        </div>

        <div className="emergency-guide-item">
          <span className="guide-icon fire">♨</span>
          <div>
            <strong>Fire</strong>
            <p>Fire or immediate fire-related danger</p>
          </div>
        </div>

        <div className="emergency-guide-item">
          <span className="guide-icon flood">〰</span>
          <div>
            <strong>Flood</strong>
            <p>Flooding or severe waterlogging</p>
          </div>
        </div>

        <div className="emergency-guide-item">
          <span className="guide-icon accident">!</span>
          <div>
            <strong>Accident</strong>
            <p>Road accident or other collision</p>
          </div>
        </div>

        <div className="emergency-help-note">
          <strong>Remember</strong>
          <p>
            If anyone is in immediate danger, contact the appropriate local
            emergency service as well.
          </p>
        </div>
      </aside>
    </section>
  );
}

export default EmergencyForm;
