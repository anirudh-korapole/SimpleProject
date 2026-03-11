import React, { useEffect, useState } from "react";
import { HotelSettings } from "../types/api.types";
import { adminGetSettings, adminUpdateSettings } from "../api/adminApi";

const fmt12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const HotelSettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<HotelSettings>({
    checkInTime: "14:00",
    checkOutTime: "11:00",
    is24Hour: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    adminGetSettings().then((res) => {
      if (res.success && res.data) setSettings(res.data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    const res = await adminUpdateSettings(settings);
    setSaving(false);
    if (res.success && res.data) {
      setSettings(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(res.message || "Failed to save settings");
    }
  };

  if (loading) return <p>Loading…</p>;

  const disabled = settings.is24Hour;

  return (
    <div style={styles.container}>
      <h3 style={{ marginTop: 0 }}>Hotel Rules</h3>
      <p style={styles.desc}>
        These rules are shown to guests during booking and apply to all rooms.
      </p>

      {error && <div style={styles.errorBanner}>{error}</div>}
      {saved && <div style={styles.successBanner}>Settings saved successfully.</div>}

      <form onSubmit={handleSave} style={styles.form}>

        {/* 24-hour toggle */}
        <div style={styles.toggleCard}>
          <div style={styles.toggleRow}>
            <div>
              <p style={styles.toggleLabel}>🕐 24-Hour Check-in</p>
              <p style={styles.toggleDesc}>
                Guests pick their own check-in time. Check-out is automatically set to 24 hours later.
                Fixed check-in / check-out times below are disabled when this is on.
              </p>
            </div>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={settings.is24Hour}
                onChange={(e) => setSettings((s) => ({ ...s, is24Hour: e.target.checked }))}
                style={{ display: "none" }}
              />
              <span style={{
                ...styles.slider,
                backgroundColor: settings.is24Hour ? "#0070f3" : "#ccc",
              }}>
                <span style={{
                  ...styles.sliderThumb,
                  transform: settings.is24Hour ? "translateX(22px)" : "translateX(2px)",
                }} />
              </span>
            </label>
          </div>
        </div>

        {/* Check-in / Check-out times */}
        <div style={{ ...styles.card, opacity: disabled ? 0.45 : 1 }}>
          <div style={styles.row}>
            {/* Check-in */}
            <div style={styles.field}>
              <label style={{ ...styles.label, color: disabled ? "#aaa" : undefined }}>
                🏨 Check-in Time
              </label>
              <p style={styles.fieldDesc}>Earliest time guests may check in.</p>
              <input
                type="time"
                value={settings.checkInTime}
                onChange={(e) => setSettings((s) => ({ ...s, checkInTime: e.target.value }))}
                style={{ ...styles.input, backgroundColor: disabled ? "#f0f0f0" : "#fff", cursor: disabled ? "not-allowed" : "auto" }}
                disabled={disabled}
                required={!disabled}
              />
              {!disabled && <span style={styles.preview}>{fmt12(settings.checkInTime)}</span>}
            </div>

            <div style={styles.divider} />

            {/* Check-out */}
            <div style={styles.field}>
              <label style={{ ...styles.label, color: disabled ? "#aaa" : undefined }}>
                🚪 Check-out Time
              </label>
              <p style={styles.fieldDesc}>Latest time guests must vacate the room.</p>
              <input
                type="time"
                value={settings.checkOutTime}
                onChange={(e) => setSettings((s) => ({ ...s, checkOutTime: e.target.value }))}
                style={{ ...styles.input, backgroundColor: disabled ? "#f0f0f0" : "#fff", cursor: disabled ? "not-allowed" : "auto" }}
                disabled={disabled}
                required={!disabled}
              />
              {!disabled && <span style={styles.preview}>{fmt12(settings.checkOutTime)}</span>}
            </div>
          </div>
          {disabled && (
            <p style={styles.disabledNote}>
              Disabled — 24-hour check-in is active.
            </p>
          )}
        </div>

        <button type="submit" style={styles.saveBtn} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container:    { maxWidth: 640 },
  desc:         { color: "#666", fontSize: "0.9rem", marginBottom: "1.25rem" },
  form:         { display: "flex", flexDirection: "column", gap: "1.25rem" },
  toggleCard:   { border: "1px solid #e0e0e0", borderRadius: 8, padding: "1.1rem 1.4rem", backgroundColor: "#fafafa" },
  toggleRow:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" },
  toggleLabel:  { fontWeight: 700, fontSize: "0.95rem", margin: "0 0 0.25rem" },
  toggleDesc:   { color: "#777", fontSize: "0.82rem", margin: 0, maxWidth: 420 },
  switch:       { cursor: "pointer", flexShrink: 0, marginTop: "0.15rem" },
  slider:       { display: "inline-block", width: 46, height: 24, borderRadius: 12, position: "relative", transition: "background-color 0.2s" },
  sliderThumb:  { position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%", backgroundColor: "#fff", transition: "transform 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" },
  card:         { border: "1px solid #e0e0e0", borderRadius: 8, padding: "1.5rem", backgroundColor: "#fafafa", transition: "opacity 0.2s" },
  row:          { display: "flex", gap: "2rem", flexWrap: "wrap" },
  divider:      { width: 1, backgroundColor: "#e0e0e0", alignSelf: "stretch" },
  field:        { display: "flex", flexDirection: "column", flex: "1 1 180px" },
  label:        { fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.25rem" },
  fieldDesc:    { color: "#888", fontSize: "0.82rem", margin: "0 0 0.6rem" },
  input:        { padding: "0.5rem 0.65rem", fontSize: "1rem", borderRadius: 4, border: "1px solid #ccc", width: "100%", boxSizing: "border-box" as const },
  preview:      { marginTop: "0.4rem", fontSize: "0.88rem", color: "#0070f3", fontWeight: 600 },
  disabledNote: { margin: "1rem 0 0", fontSize: "0.82rem", color: "#aaa", textAlign: "center" as const },
  saveBtn:      { alignSelf: "flex-start", padding: "0.55rem 1.4rem", fontSize: "0.95rem", cursor: "pointer", backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: 4 },
  errorBanner:  { backgroundColor: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb", padding: "0.6rem 0.9rem", borderRadius: 4 },
  successBanner:{ backgroundColor: "#d4edda", color: "#155724", border: "1px solid #c3e6cb", padding: "0.6rem 0.9rem", borderRadius: 4 },
};

export default HotelSettingsPanel;
