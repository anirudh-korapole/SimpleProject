import React, { useEffect, useState } from "react";
import { Room, RoomType } from "../types/api.types";
import { adminGetRooms, adminCreateRoom, adminDeleteRoom, adminUpdateAvailability, adminGetRoomTypes } from "../api/adminApi";

const EMPTY_FORM = {
  roomNumber: "",
  roomTypeId: "",
  capacity: "",
  bedType: "double",
  toiletType: "western",
  hasAC: false,
  hasWifi: false,
  hasGeyser: false,
  smokingAllowed: false,
  hasElectricityBackup: false,
};

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    const res = await adminGetRooms();
    if (res.success && res.data) {
      setRooms(res.data);
    } else {
      setError(res.message || "Failed to load rooms");
    }
    setLoading(false);
  };

  const fetchRoomTypes = async () => {
    const res = await adminGetRoomTypes();
    if (res.success && res.data) setRoomTypes(res.data);
  };

  useEffect(() => { fetchRooms(); fetchRoomTypes(); }, []);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.roomNumber.trim() || !form.capacity) {
      setFormError("Room number and capacity are required.");
      return;
    }

    const capacity = parseInt(form.capacity, 10);
    if (isNaN(capacity) || capacity < 1) {
      setFormError("Capacity must be a positive number.");
      return;
    }

    setSubmitting(true);
    const res = await adminCreateRoom({
      roomNumber: form.roomNumber.trim(),
      roomType: null,
      roomTypeId: form.roomTypeId ? parseInt(form.roomTypeId, 10) : null,
      capacity,
      isAvailable: true,
      hasAC: form.hasAC,
      hasWifi: form.hasWifi,
      hasGeyser: form.hasGeyser,
      smokingAllowed: form.smokingAllowed,
      hasElectricityBackup: form.hasElectricityBackup,
      toiletType: form.toiletType,
      bedType: form.bedType,
    });
    setSubmitting(false);

    if (res.success) {
      setForm(EMPTY_FORM);
      fetchRooms();
    } else {
      setFormError(res.message || "Failed to create room");
    }
  };

  const handleToggleAvailability = async (room: Room) => {
    await adminUpdateAvailability(room.id, !room.isAvailable);
    fetchRooms();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this room?")) return;
    await adminDeleteRoom(id);
    fetchRooms();
  };

  return (
    <div>
      {/* ── Add Room Form ────────────────────────────────────────────── */}
      <h3 style={{ marginTop: 0 }}>Add Room</h3>
      {formError && <div style={styles.errorBanner}>{formError}</div>}
      <form onSubmit={handleAddRoom} style={styles.addForm}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Room Number</label>
            <input name="roomNumber" value={form.roomNumber} onChange={handleFormChange} style={styles.input} placeholder="e.g. 101" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Room Type <span style={{ fontWeight: 400, color: "#888" }}>(optional)</span></label>
            <select name="roomTypeId" value={form.roomTypeId} onChange={handleFormChange} style={styles.input}>
              <option value="">— None —</option>
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>{rt.name}</option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Capacity</label>
            <input name="capacity" type="number" min={1} value={form.capacity} onChange={handleFormChange} style={styles.input} placeholder="e.g. 2" />
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Bed Type</label>
            <select name="bedType" value={form.bedType} onChange={handleFormChange} style={styles.input}>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="queen">Queen</option>
              <option value="king">King</option>
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Toilet Type</label>
            <select name="toiletType" value={form.toiletType} onChange={handleFormChange} style={styles.input}>
              <option value="western">Western</option>
              <option value="indian">Indian</option>
            </select>
          </div>
        </div>
        <div style={styles.checkboxRow}>
          {(["hasAC", "hasWifi", "hasGeyser", "smokingAllowed", "hasElectricityBackup"] as const).map((key) => (
            <label key={key} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name={key}
                checked={form[key] as boolean}
                onChange={handleFormChange}
              />
              {" "}
              {{ hasAC: "AC", hasWifi: "WiFi", hasGeyser: "Geyser", smokingAllowed: "Smoking", hasElectricityBackup: "24/7 Electricity" }[key]}
            </label>
          ))}
        </div>
        <button type="submit" style={styles.addButton} disabled={submitting}>
          {submitting ? "Adding…" : "Add Room"}
        </button>
      </form>

      {/* ── Room Table ───────────────────────────────────────────────── */}
      <h3 style={{ marginTop: "2rem" }}>All Rooms</h3>
      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p style={{ color: "#721c24" }}>{error}</p>
      ) : rooms.length === 0 ? (
        <p>No rooms yet. Add one above.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["#", "Type", "Cap", "Bed", "Toilet", "AC", "WiFi", "Geyser", "Smoke", "Elec", "Available", "Actions"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td style={styles.td}>{r.roomNumber}</td>
                  <td style={styles.td}>
                    {r.roomTypeId
                      ? (roomTypes.find((rt) => rt.id === r.roomTypeId)?.name ?? "—")
                      : (r.roomType ?? "—")}
                  </td>
                  <td style={styles.td}>{r.capacity}</td>
                  <td style={styles.td}>{r.bedType}</td>
                  <td style={styles.td}>{r.toiletType}</td>
                  <td style={styles.tdCenter}>{r.hasAC ? "✓" : "—"}</td>
                  <td style={styles.tdCenter}>{r.hasWifi ? "✓" : "—"}</td>
                  <td style={styles.tdCenter}>{r.hasGeyser ? "✓" : "—"}</td>
                  <td style={styles.tdCenter}>{r.smokingAllowed ? "✓" : "—"}</td>
                  <td style={styles.tdCenter}>{r.hasElectricityBackup ? "✓" : "—"}</td>
                  <td style={styles.tdCenter}>
                    <button
                      onClick={() => handleToggleAvailability(r)}
                      style={{ ...styles.toggleBtn, backgroundColor: r.isAvailable ? "#28a745" : "#dc3545" }}
                    >
                      {r.isAvailable ? "Yes" : "No"}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleDelete(r.id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  addForm: { display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" },
  row: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  field: { display: "flex", flexDirection: "column", gap: "0.25rem", flex: "1 1 140px" },
  label: { fontWeight: 600, fontSize: "0.85rem" },
  input: { padding: "0.5rem 0.6rem", fontSize: "0.95rem", borderRadius: 4, border: "1px solid #ccc" },
  checkboxRow: { display: "flex", gap: "1.25rem", flexWrap: "wrap" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem", cursor: "pointer" },
  addButton: {
    alignSelf: "flex-start",
    padding: "0.5rem 1.2rem",
    fontSize: "0.95rem",
    cursor: "pointer",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: 4,
  },
  errorBanner: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
    padding: "0.6rem 0.9rem",
    borderRadius: 4,
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" },
  th: {
    textAlign: "left",
    padding: "0.4rem 0.6rem",
    backgroundColor: "#f0f0f0",
    borderBottom: "2px solid #ddd",
    whiteSpace: "nowrap",
  },
  td: { padding: "0.4rem 0.6rem", borderBottom: "1px solid #eee" },
  tdCenter: { padding: "0.4rem 0.6rem", borderBottom: "1px solid #eee", textAlign: "center" },
  toggleBtn: {
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "0.2rem 0.6rem",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "0.2rem 0.6rem",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
};

export default RoomManagement;
