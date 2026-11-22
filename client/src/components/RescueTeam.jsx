
import { useState, useEffect } from "react";
import "./RescueTeam.css";

const initialTeams = [
  {
    id: 1,
    name: "Team Alpha",
    leader: "Rahul Kumar",
    members: 5,
    location: "Patna",
    contact: "9876543210",
    status: "Available",
  },
  {
    id: 2,
    name: "Team Bravo",
    leader: "Amit Singh",
    members: 4,
    location: "Gaya",
    contact: "9876543211",
    status: "Busy",
  },
];

function RescueTeam() {
  const [teams, setTeams] = useState(initialTeams);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    leader: "",
    members: "",
    location: "",
    contact: "",
    status: "Available",
  });

  // Fetch rescue teams from MongoDB
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/v1/rescue-teams"
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to fetch rescue teams"
          );
        }

        setTeams(result.data);
      } catch (error) {
        console.error("Error fetching rescue teams:", error);
      }
    };

    fetchTeams();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add and Edit rescue team
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const isEditing = Boolean(editingId);

      const url = isEditing
        ? `http://localhost:5001/api/v1/rescue-teams/${editingId}`
        : "http://localhost:5001/api/v1/rescue-teams";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          leader: form.leader,
          members: Number(form.members),
          location: form.location,
          contact: form.contact,
          status: form.status,
          ...(!isEditing && {
            teamId: `TEAM-${Date.now()}`,
          }),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to save rescue team"
        );
      }

      // Refresh team list from MongoDB
      const teamsResponse = await fetch(
        "http://localhost:5001/api/v1/rescue-teams"
      );

      const teamsResult = await teamsResponse.json();

      if (!teamsResponse.ok || !teamsResult.success) {
        throw new Error(
          "Team saved, but list could not be refreshed"
        );
      }

      setTeams(teamsResult.data);
      closeForm();

      alert(
        isEditing
          ? "Rescue team updated successfully!"
          : "Rescue team added successfully!"
      );
    } catch (error) {
      console.error("Error saving rescue team:", error);
      alert(error.message);
    }
  };

  // Close and reset form
  const closeForm = () => {
    setForm({
      name: "",
      leader: "",
      members: "",
      location: "",
      contact: "",
      status: "Available",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // Open edit form
  const editTeam = (team) => {
    setForm({
      name: team.name,
      leader: team.leader,
      members: String(team.members),
      location: team.location,
      contact: team.contact,
      status: team.status,
    });

    setEditingId(team.id);
    setShowForm(true);
  };

  // Delete rescue team
  const deleteTeam = async (id) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        const response = await fetch(
          `http://localhost:5001/api/v1/rescue-teams/${id}`,
          {
            method: "DELETE",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to delete rescue team"
          );
        }

        const teamsResponse = await fetch(
          "http://localhost:5001/api/v1/rescue-teams"
        );

        const teamsResult = await teamsResponse.json();

        if (!teamsResponse.ok || !teamsResult.success) {
          throw new Error(
            "Team deleted, but list could not be refreshed"
          );
        }

        setTeams(teamsResult.data);

        alert("Rescue team deleted successfully!");
      } catch (error) {
        console.error("Error deleting rescue team:", error);
        alert(error.message);
      }
    }
  };

  // Search teams
  const filteredTeams = teams.filter((team) =>
    `${team.name} ${team.leader} ${team.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="rescue-page">
      <div className="rescue-header">
        <div>
          <h1>Rescue Team Management</h1>
          <p>Manage and monitor emergency response teams</p>
        </div>

        <button
          className="add-team-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Rescue Team
        </button>
      </div>

      <div className="rescue-stats">
        <div className="rescue-stat-card">
          <h3>Total Teams</h3>
          <h2>{teams.length}</h2>
        </div>

        <div className="rescue-stat-card">
          <h3>Available Teams</h3>
          <h2>
            {teams.filter((t) => t.status === "Available").length}
          </h2>
        </div>

        <div className="rescue-stat-card">
          <h3>Busy Teams</h3>
          <h2>
            {teams.filter((t) => t.status === "Busy").length}
          </h2>
        </div>

        <div className="rescue-stat-card">
          <h3>Total Members</h3>
          <h2>
            {teams.reduce(
              (sum, t) => sum + Number(t.members),
              0
            )}
          </h2>
        </div>
      </div>

      <input
        className="rescue-search"
        type="text"
        placeholder="Search by team, leader or location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {showForm && (
        <div className="rescue-form-card">
          <h2>
            {editingId
              ? "Edit Rescue Team"
              : "Add New Rescue Team"}
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              name="name"
              placeholder="Team Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="leader"
              placeholder="Team Leader"
              value={form.leader}
              onChange={handleChange}
              required
            />

            <input
              name="members"
              type="number"
              min="1"
              placeholder="Number of Members"
              value={form.members}
              onChange={handleChange}
              required
            />

            <input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              required
            />

            <input
              name="contact"
              type="tel"
              placeholder="Contact Number"
              value={form.contact}
              onChange={handleChange}
              required
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option>Available</option>
              <option>Busy</option>
              <option>Offline</option>
            </select>

            <div className="rescue-form-actions">
              <button
                type="submit"
                className="add-team-btn"
              >
                {editingId ? "Update Team" : "Save Team"}
              </button>

              <button type="button" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rescue-team-grid">
        {filteredTeams.map((team) => (
          <div className="rescue-team-card" key={team.id}>
            <div className="rescue-team-top">
              <h2>{team.name}</h2>

              <span
                className={`team-status ${team.status.toLowerCase()}`}
              >
                {team.status}
              </span>
            </div>

            <p>
              <strong>Leader:</strong> {team.leader}
            </p>

            <p>
              <strong>Members:</strong> {team.members}
            </p>

            <p>
              <strong>Location:</strong> {team.location}
            </p>

            <p>
              <strong>Contact:</strong> {team.contact}
            </p>

            <div className="rescue-card-actions">
              <button onClick={() => editTeam(team)}>
                Edit
              </button>

              <button onClick={() => deleteTeam(team.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}

        {filteredTeams.length === 0 && (
          <p>No rescue teams found.</p>
        )}
      </div>
    </div>
  );
}

export default RescueTeam;
