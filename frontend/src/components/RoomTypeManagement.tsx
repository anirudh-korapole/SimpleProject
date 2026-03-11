import React, { useEffect, useState } from "react";
import { RoomType } from "../types/api.types";
import { adminGetRoomTypes, adminCreateRoomType, adminDeleteRoomType } from "../api/adminApi";

const RoomTypeManagement: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRoomTypes = async () => {
    const res = await adminGetRoomTypes();
    if (res.success && res.data) {
      setRoomTypes(res.data);
    } else {
      setError(res.message || "Failed to load room types");
    }
    setLoading(false);
  };

  useEffect(() => { fetchRoomTypes(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Name is required.");
      return;
    }

    setSubmitting(true);
    const res = await adminCreateRoomType({ name: name.trim(), description: description.trim() || undefined });
    setSubmitting(false);

    if (res.success) {
      setName("");
      setDescription("");
      fetchRoomTypes();
    } else {
      setFormError(res.message || "Failed to create room type");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this room type? Rooms referencing it will have their type cleared.")) return;
    await adminDeleteRoomType(id);
    fetchRoomTypes();
  };

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Add Room Type</h3>
      {formError && <div style={styles.errorBanner}>{formError}</div>}
      <form onSubmit={handleAdd} style={styles.addForm}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              placeholder="e.g. Deluxe, Suite, Standard"
            />
          </div>
          <div style={{ ...styles.field, flex: "2 1 260px" }}>
            <label style={styles.label}>
              Description <span style={{ fontWeight: 400, color: "#888" }}>(optional)</span>
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.input}
              placeholder="Short description of this room type"
            />
          </div>
        </div>
        <button type="submit" style={styles.addButton} disabled={submitting}>
          {submitting ? "Adding…" : "Add Room Type"}
        </button>
      </form>

      <h3 style={{ marginTop: "2rem" }}>All Room Types</h3>
      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p style={{ color: "#721c24" }}>{error}</p>
      ) : roomTypes.length === 0 ? (
        <p>No room types yet. Add one above.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["ID", "Name", "Description", "Created", "Actions"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roomTypes.map((rt) => (
                <tr key={rt.id}>
                  <td style={styles.td}>{rt.id}</td>
                  <td style={styles.td}><strong>{rt.name}</strong></td>
                  <td style={styles.td}>{rt.description ?? <span style={{ color: "#aaa" }}>—</span>}</td>
                  <td style={styles.td}>{new Date(rt.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleDelete(rt.id)} style={styles.deleteBtn}>Delete</button>
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
  field: { display: "flex", flexDirection: "column", gap: "0.25rem", flex: "1 1 160px" },
  label: { fontWeight: 600, fontSize: "0.85rem" },
  input: { padding: "0.5rem 0.6rem", fontSize: "0.95rem", borderRadius: 4, border: "1px solid #ccc" },
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

export default RoomTypeManagement;
