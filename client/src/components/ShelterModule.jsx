
import { useEffect, useMemo, useState } from "react";
import "./ShelterModule.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1";

const initialForm = {
  shelterId: "",
  name: "",
  location: "",
  address: "",
  status: "Available",
  available: "",
  capacity: "",
  facilities: "",
  latitude: "",
  longitude: "",
};

function ShelterModule() {
  const [shelters, setShelters] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function fetchShelters() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/shelters`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch shelters");
      }

      setShelters(result.data);
    } catch (err) {
      setError(err.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShelters();
  }, []);

  const filteredShelters = useMemo(() => {
    return shelters.filter((shelter) => {
      const matchesSearch =
        shelter.name.toLowerCase().includes(search.toLowerCase()) ||
        shelter.location.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || shelter.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [shelters, search, filter]);

  const availableCount = shelters.filter(
    (s) => s.status === "Available"
  ).length;

  const limitedCount = shelters.filter(
    (s) => s.status === "Limited"
  ).length;

  async function handleDelete(shelter) {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${shelter.name}?`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/shelters/${shelter.id}`,
      { method: "DELETE" }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to delete shelter");
    }

    setShelters((previous) =>
      previous.filter((item) => item.id !== shelter.id)
    );

    setSuccessMessage("Shelter deleted successfully!");
    setFormError("");
  } catch (err) {
    setError(err.message || "Unable to delete shelter");
  }
}
   function handleEdit(shelter) {
    setEditingId(shelter.id);
    setForm({
    shelterId: shelter.id,
    name: shelter.name,
    location: shelter.location,
    address: shelter.address,
    status: shelter.status,
    available: String(shelter.available),
    capacity: String(shelter.capacity),
    facilities: shelter.facilities.join(", "),
    latitude: String(shelter.latitude),
    longitude: String(shelter.longitude),
  });
  setShowForm(true);
  setFormError("");
  setSuccessMessage("");
}
  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    const available = Number(form.available);
    const capacity = Number(form.capacity);
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (
      !Number.isInteger(available) ||
      !Number.isInteger(capacity) ||
      available < 0 ||
      capacity < 1 ||
      available > capacity
    ) {
      setFormError(
        "Enter valid capacity values. Available places cannot exceed total capacity."
      );
      return;
    }

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setFormError("Please enter valid latitude and longitude values.");
      return;
    }

    const shelterData = {
      shelterId: form.shelterId.trim(),
      name: form.name.trim(),
      location: form.location.trim(),
      address: form.address.trim(),
      status: form.status,
      available,
      capacity,
      facilities: form.facilities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      latitude,
      longitude,
    };

    try {
      setSaving(true);

     const response = await fetch(
  editingId
    ? `${API_BASE_URL}/shelters/${editingId}`
    : `${API_BASE_URL}/shelters`,
  {
    method: editingId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(shelterData),
  }
);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to add shelter");
      }

      if (editingId) {
  setShelters((previous) =>
    previous.map((shelter) =>
      shelter.id === editingId ? result.data : shelter
    )
  );
  setSuccessMessage("Shelter updated successfully!");
} else {
  setShelters((previous) => [result.data, ...previous]);
  setSuccessMessage("Shelter added successfully!");
}

setEditingId(null);
      setForm(initialForm);
      setShowForm(false);
      setSuccessMessage("Shelter added successfully!");
    } catch (err) {
      setFormError(err.message || "Unable to add shelter");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="shelter-module">
      <div className="shelter-header">
        <div>
          <h2>Shelter Information</h2>
          <p>View emergency shelter information and availability.</p>
        </div>

        <span className="demo-label">DATABASE CONNECTED</span>
      </div>

      <div className="shelter-actions">
        <button
          type="button"
          className="add-shelter-button"
          onClick={() => {
            setShowForm((previous) => !previous);
            setFormError("");
            setSuccessMessage("");
          }}
        >
          {showForm ? "Cancel" : "+ Add New Shelter"}
        </button>
      </div>

      {successMessage && (
        <p className="shelter-success">{successMessage}</p>
      )}

      {showForm && (
        <form className="shelter-form" onSubmit={handleSubmit}>
         <h3>{editingId ? "Edit Shelter" : "Add New Shelter"}</h3>

          <div className="shelter-form-grid">
            <label>
              Shelter ID
              <input
                name="shelterId"
                value={form.shelterId}
                onChange={handleInputChange}
                placeholder="e.g. SHL-001"
                required
              />
            </label>

            <label>
              Shelter Name
              <input
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Enter shelter name"
                required
              />
            </label>

            <label>
              Location / City
              <input
                name="location"
                value={form.location}
                onChange={handleInputChange}
                placeholder="Enter city"
                required
              />
            </label>

            <label>
              Address
              <input
                name="address"
                value={form.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                required
              />
            </label>

            <label>
              Status
              <select
                name="status"
                value={form.status}
                onChange={handleInputChange}
              >
                <option value="Available">Available</option>
                <option value="Limited">Limited</option>
                <option value="Full">Full</option>
              </select>
            </label>

            <label>
              Available Places
              <input
                type="number"
                name="available"
                min="0"
                value={form.available}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Total Capacity
              <input
                type="number"
                name="capacity"
                min="1"
                value={form.capacity}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Facilities (comma separated)
              <input
                name="facilities"
                value={form.facilities}
                onChange={handleInputChange}
                placeholder="Food, Water, Medical Aid"
              />
            </label>

            <label>
              Latitude
              <input
                type="number"
                name="latitude"
                step="any"
                min="-90"
                max="90"
                value={form.latitude}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Longitude
              <input
                type="number"
                name="longitude"
                step="any"
                min="-180"
                max="180"
                value={form.longitude}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>

          {formError && (
            <p className="shelter-form-error">{formError}</p>
          )}

          <button
            type="submit"
            className="add-shelter-button"
            disabled={saving}
          >
            {saving
  ? "Saving..."
  : editingId
  ? "Update Shelter"
  : "Save Shelter"}
          </button>
        </form>
      )}

      <div className="shelter-controls">
        <input
          type="text"
          placeholder="Search by shelter name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Shelters</option>
          <option value="Available">Available</option>
          <option value="Limited">Limited</option>
          <option value="Full">Full</option>
        </select>
      </div>

      <div className="shelter-summary">
        <div>
          <h3>{shelters.length}</h3>
          <p>Total Shelters</p>
        </div>

        <div>
          <h3>{availableCount}</h3>
          <p>Available</p>
        </div>

        <div>
          <h3>{limitedCount}</h3>
          <p>Limited</p>
        </div>
      </div>

      <div className="shelter-list">
        {loading ? (
          <p className="no-shelters">Loading shelters...</p>
        ) : error ? (
          <p className="no-shelters">
            {error}. Please check that the backend server is running.
          </p>
        ) : filteredShelters.length > 0 ? (
          filteredShelters.map((shelter) => (
            <div className="shelter-card" key={shelter.id}>
              <div className="shelter-card-top">
                <div>
                  <h3>{shelter.name}</h3>
                  <p>📍 {shelter.location}</p>
                </div>

                <span
                  className={`shelter-status ${shelter.status.toLowerCase()}`}
                >
                  {shelter.status}
                </span>
              </div>

              <p className="shelter-address">{shelter.address}</p>

              <div className="shelter-capacity">
                <span>Available capacity</span>
                <strong>
                  {shelter.available} / {shelter.capacity}
                </strong>
              </div>

              <div className="capacity-track">
                <div
                  className="capacity-fill"
                  style={{
                    width: `${
                      (shelter.available / shelter.capacity) * 100
                    }%`,
                  }}
                />
              </div>

              <div className="shelter-facilities">
                <strong>Facilities:</strong>
                <div>
                  {shelter.facilities.map((facility) => (
                    <span key={facility}>{facility}</span>
                  ))}
                </div>
              </div>

              <p className="shelter-coordinates">
                Coordinates: {shelter.latitude}, {shelter.longitude}
              </p>

              <button
  type="button"
  className="add-shelter-button"
  onClick={() => handleEdit(shelter)}
>
  Edit
</button>

<button
  type="button"
  className="add-shelter-button"
  onClick={() => handleDelete(shelter)}
  style={{
    backgroundColor: "#dc2626",
    marginLeft: "10px",
  }}
>
  Delete
</button>
 {shelter.id.startsWith("TEST-") && (
     <p className="no-shelters">
                Test record — not a verified real-world shelter.
            </p>
              )}
            </div>
          ))
        ) : (
          <p className="no-shelters">
            No shelters found. Try another search.
          </p>
        )}
      </div>
    </div>
  );
}

export default ShelterModule;
